import {
  CommandConfig,
  Factory,
} from '@comet-cli/types';
import {
  Action,
  OpenApiSpecJsonDecorated,
} from '@comet-cli/decorator-json-schemas/types/json-schema';
import { ensureDir, emptyDir, writeJSONSync, rmdir } from 'fs-extra';
const path = require('path');

export default class JsonSchemaFactory implements Factory {
  /**
   * Get the module name.
   */
  getName(): string {
    return 'factory-json-schemas';
  }

  /**
   * Generate and export JSON Schemas from a comet meta-model.
   * @param model
   * @param config
   */
  async execute(model: OpenApiSpecJsonDecorated , config: CommandConfig): Promise<string[]> {
    const outputDir = config.output;
    await ensureDir(path.join(outputDir, 'requests'));
    await emptyDir(path.join(outputDir, 'requests'));
    await ensureDir(path.join(outputDir, 'responses'));
    await emptyDir(path.join(outputDir, 'responses'));
    const actions: Action[] = model.decorated.jsonSchemas;
    await this.exportSchemas(actions, outputDir);
    return [];
  }

  /**
   * Export all generated JSON Schemas.
   * @param actions
   * @param outputDir
   */
  protected async exportSchemas(actions: Action[], outputDir: string) {
    let hasRequests = false;
    let hasResponses = false;
    actions.map((action: Action) => {
      const filename = JsonSchemaFactory.getFilePath(action.$name, action.$operation);
      writeJSONSync(path.join(outputDir, filename), action.schema, { spaces: 4 });
      if (action.$operation === 'request') {
        hasRequests = true;
      }
      if (action.$operation === 'response') {
        hasResponses = true;
      }
    });

    // Delete empty directories
    if (hasRequests === false) {
      await rmdir(path.join(outputDir, 'requests'));
    }
    if (hasResponses === false) {
      await rmdir(path.join(outputDir, 'responses'));
    }
  }

  /**
   * Transform a path into a readable file name
   * `GET countries/{country}/assets` -> `countries-assets-index-response.json`
   * `GET countries` -> `countries-index-response.json`
   * `GET countries/{id}` -> `countries-show-response.json`
   * `POST countries` -> `countries-store-response.json`
   * @param name
   * @param operation
   */
  protected static getFilePath(name: string, operation: 'request' | 'response'): string {
    return path.join(`${operation}s`, `${name}.json`);
  }
}
