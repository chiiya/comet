import {
  OpenAPIMediaTypes,
  OpenAPIOperation,
  OpenApiSpec,
  Decorator,
} from '@comet-cli/types';
import Transformer from './transformer';
import { Action, OpenApiSpecJsonDecorated } from '../types/json-schema';

export default class JsonSchemaDecorator implements Decorator {
  /**
   * Execute the json schema decorator.
   * @param model
   */
  public execute(model: OpenApiSpec): OpenApiSpecJsonDecorated {
    let actions: Action[] = [];
    Object.keys(model.paths).forEach((path) => {
      const methods = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      methods.forEach((method) => {
        if (model.paths[path][method]) {
          actions = actions.concat(...this.generateSchemas(path, method, model.paths[path][method]));
        }
      });
    });

    model.decorated.jsonSchemas = actions;
    return model;
  }

  /**
   * Generate schemas for a given API operation.
   * @param path
   * @param method
   * @param operation
   */
  protected generateSchemas(
    path: string,
    method: string,
    operation: OpenAPIOperation,
  ): Action[] {
    let actions: Action[] = [];
    // Check whether a request body has been defined
    if (operation.requestBody) {
      const content = operation.requestBody.content;
      // Iterate over media type contents, build schemas for json contents
      actions = actions.concat(...this.createFromMediaTypes(content, path, method, 'request'));
    }
    // Build schemas from successful responses (2xx) codes
    Object.keys(operation.responses).forEach((code: string) => {
      if (code.startsWith('2') === false) {
        return;
      }
      if (operation.responses[code].content) {
        const content = operation.responses[code].content;
        actions = actions.concat(...this.createFromMediaTypes(content, path, method, 'response'));
      }
    });

    return actions;
  }

  /**
   * Create transformed JSON Schema definitions from media types map.
   * @param types
   * @param path
   * @param method
   * @param operation
   */
  protected createFromMediaTypes(
    types: OpenAPIMediaTypes,
    path: string,
    method: string,
    operation: 'request' | 'response',
  ): Action[] {
    const actions: Action[] = [];
    Object.keys(types).forEach((type: string) => {
      if (type.includes('json')) {
        if (types[type].schema) {
          const schema = Transformer.execute(types[type].schema);
          actions.push({
            schema,
            $path: path,
            $method: method,
            $operation: operation,
          });
        }
      }
    });
    return actions;
  }
}
