import {
  Factory, OpenAPISchema,
  OpenApiSpec,
} from '@comet-cli/types';
import { ensureDirSync, emptyDirSync, writeJSONSync } from 'fs-extra';
const path = require('path');

export default class JsonSchemaFactory implements Factory {
  /**
   * Generate and export JSON Schemas from a comet meta-model.
   * @param model
   */
  async execute(model: OpenApiSpec) {
    ensureDirSync(path.join('exports', 'schemas', 'requests'));
    emptyDirSync(path.join('exports', 'schemas', 'requests'));
    ensureDirSync(path.join('exports', 'schemas', 'responses'));
    emptyDirSync(path.join('exports', 'schemas', 'responses'));
    const schemas: OpenAPISchema[] = model.decorated['jsonSchemas'];
    this.exportSchemas(schemas);
  }

  /**
   * Export all generated JSON Schemas.
   * @param schemas
   */
  protected exportSchemas(schemas: OpenAPISchema[]) {
    schemas.map((schema) => {
      const path = JsonSchemaFactory.getFilePath(schema['_path'], schema['_method'], schema['_operation']);
      delete schema['_path'];
      delete schema['_method'];
      delete schema['_operation'];
      console.log(path);
      writeJSONSync(`exports/schemas/${path}`, schema, { spaces: 4 });
    });
  }

  /**
   * Transform a path into a readable file name
   * `GET countries/{country}/assets` -> `countries-assets-index-response.json`
   * `GET countries` -> `countries-index-response.json`
   * `GET countries/{id}` -> `countries-show-response.json`
   * `POST countries` -> `countries-store-response.json`
   * @param apiPath
   * @param method
   * @param operation
   */
  protected static getFilePath(apiPath: string, method: string, operation: 'request' | 'response'): string {
    const parameterEndsPath = /(\/?{.+}\/?$)/g;
    let isSingleResourceOperation = false;
    if (parameterEndsPath.test(path) === true) {
      isSingleResourceOperation = true;
    }
    const base = apiPath
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

    return path.join(`${operation}s`, `${base}-${suffix}.json`);
  }
}
