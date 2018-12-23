import {
  Factory,
  OpenAPIMediaTypes,
  OpenAPIOperation,
  OpenApiSpec,
} from '@comet-cli/types';
import { SchemaExport } from '../types/schema';
import Transformer from './transformer';
import { ensureDirSync, emptyDirSync, writeJSONSync } from 'fs-extra';

export default class JsonSchemaFactory implements Factory {
  /**
   * Generate and export JSON Schemas from a comet meta-model.
   * @param model
   */
  async execute(model: OpenApiSpec) {
    ensureDirSync('exports/schemas');
    emptyDirSync('exports/schemas');
    Object.keys(model.paths).forEach((path) => {
      const operations = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      operations.forEach((operation) => {
        if (model.paths[path][operation]) {
          const schemas = this.generateSchemas(path, operation, model.paths[path][operation]);
          this.export(schemas);
        }
      });
    });
  }

  /**
   * Export all generated JSON Schemas.
   * @param schemas
   */
  protected export(schemas: SchemaExport) {
    Object.keys(schemas).map((path) => {
      writeJSONSync(`exports/schemas/${path}`, schemas[path], { spaces: 4 });
    });
  }

  /**
   * Generate schemas for a given API operation.
   * @param path
   * @param method
   * @param operation
   */
  protected generateSchemas(path: string, method: string, operation: OpenAPIOperation): SchemaExport {
    let schemas: SchemaExport = {};
    // Check whether a request body has been defined
    if (operation.requestBody) {
      const request = operation.requestBody;
      // Iterate over media type contents, build schemas for json contents
      schemas = this.createFromMediaTypes(request.content, schemas, path, method);
    }
    // Build schemas from successful responses (2xx) codes
    Object.keys(operation.responses).forEach((code: string) => {
      if (code.startsWith('2') === false) {
        return;
      }
      if (operation.responses[code].content) {
        schemas = this.createFromMediaTypes(operation.responses[code].content, schemas, path, method);
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
   */
  protected createFromMediaTypes(
    types: OpenAPIMediaTypes,
    schemas: SchemaExport,
    path: string,
    method: string,
  ) {
    Object.keys(types).forEach((type: string) => {
      if (type.includes('json')) {
        if (types[type].schema) {
          const name = JsonSchemaFactory.getFilePath(path, method, 'request');
          schemas[name] = Transformer.execute(types[type].schema);
        }
      }
    });
    return schemas;
  }

  /**
   * Transform a path into a readable file name
   * `GET countries/{country}/assets` -> `countries-assets-index-response.json`
   * `GET countries` -> `countries-index-response.json`
   * `GET countries/{id}` -> `countries-show-response.json`
   * `POST countries` -> `countries-store-response.json`
   * @param path
   * @param method
   * @param type
   */
  protected static getFilePath(path: string, method: string, type: 'request' | 'response'): string {
    const parameterEndsPath = /(\/?{.+}\/?$)/g;
    let isSingleResourceOperation = false;
    if (parameterEndsPath.test(path) === true) {
      isSingleResourceOperation = true;
    }
    const base = path
      .replace(/^\//, '')
      .replace(/(\/?{.+}(?:\/$)?)/g, '')
      .replace('/', '-');
    let suffix;
    switch (method) {
      case 'get':
        if (isSingleResourceOperation === true) {
          suffix = 'show';
        } else {
          suffix = 'index';
        }
        break;
      case 'post':
        suffix = 'store';
        break;
      case 'put':
      case 'patch':
        suffix = 'update';
        break;
      default:
        suffix = method;
    }

    return `${base}-${suffix}-${type}.json`;
  }
}
