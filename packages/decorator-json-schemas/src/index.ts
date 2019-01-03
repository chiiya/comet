import {
  OpenAPIMediaTypes,
  OpenAPIOperation,
  OpenApiSpec,
  Decorator,
} from '@comet-cli/types';
import Transformer from './transformer';
import { JsonSchema, OpenApiSpecJsonDecorated } from '../types/OpenApiSpec';

export default class JsonSchemaDecorator implements Decorator {
  /**
   * Execute the json schema decorator.
   * @param model
   */
  public execute(model: OpenApiSpec): OpenApiSpecJsonDecorated {
    let schemas: JsonSchema[] = [];
    Object.keys(model.paths).forEach((path) => {
      const methods = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      methods.forEach((method) => {
        if (model.paths[path][method]) {
          schemas = schemas.concat(this.generateSchemas(path, method, model.paths[path][method]));
        }
      });
    });

    model.decorated.jsonSchemas = schemas;
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
  ): JsonSchema[] {
    let schemas: JsonSchema[] = [];
    // Check whether a request body has been defined
    if (operation.requestBody) {
      const request = operation.requestBody;
      // Iterate over media type contents, build schemas for json contents
      schemas = this.createFromMediaTypes(request.content, schemas, path, method, 'request');
    }
    // Build schemas from successful responses (2xx) codes
    Object.keys(operation.responses).forEach((code: string) => {
      if (code.startsWith('2') === false) {
        return;
      }
      if (operation.responses[code].content) {
        schemas = this.createFromMediaTypes(operation.responses[code].content, schemas, path, method, 'response');
      }
    });

    return schemas;
  }

  /**
   * Create transformed JSON Schema definitions from media types map.
   * @param types
   * @param schemas
   * @param path
   * @param method
   * @param operation
   */
  protected createFromMediaTypes(
    types: OpenAPIMediaTypes,
    schemas: JsonSchema[],
    path: string,
    method: string,
    operation: 'request' | 'response',
  ): JsonSchema[] {
    Object.keys(types).forEach((type: string) => {
      if (type.includes('json')) {
        if (types[type].schema) {
          const schema = Transformer.execute(types[type].schema);
          schema.$path = path;
          schema.$method = method;
          schema.$operation = operation;
          schemas.push(schema);
        }
      }
    });
    return schemas;
  }
}
