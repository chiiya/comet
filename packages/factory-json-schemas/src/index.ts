import {
  CommandConfig,
  Factory,
} from '@comet-cli/types';
import {
  JsonSchema,
  OpenApiSpecJsonDecorated,
} from '@comet-cli/decorator-json-schemas/types/OpenApiSpec';
import { ensureDirSync, emptyDirSync, writeJSONSync } from 'fs-extra';
const path = require('path');

export default class JsonSchemaFactory implements Factory {
  /**
   * Generate and export JSON Schemas from a comet meta-model.
   * @param model
   * @param config
   */
  async execute(model: OpenApiSpecJsonDecorated , config: CommandConfig) {
    const outputDir = config.output;
    ensureDirSync(path.join(outputDir, 'requests'));
    emptyDirSync(path.join(outputDir, 'requests'));
    ensureDirSync(path.join(outputDir, 'responses'));
    emptyDirSync(path.join(outputDir, 'responses'));
    const schemas: JsonSchema[] = model.decorated.jsonSchemas;
    this.exportSchemas(schemas, outputDir);
  }

  /**
   * Export all generated JSON Schemas.
   * @param schemas
   * @param outputDir
   */
  protected exportSchemas(schemas: JsonSchema[], outputDir: string) {
    schemas.map((schema) => {
      const filename = JsonSchemaFactory.getFilePath(schema.$path, schema.$method, schema.$operation);
      // Remove invalid keys.
      delete schema.$path;
      delete schema.$method;
      delete schema.$operation;
      writeJSONSync(path.join(outputDir, filename), schema, { spaces: 4 });
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
