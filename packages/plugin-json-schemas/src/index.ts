import {
  ApiModel, Bodies, CommandConfig, LoggerInterface, PluginInterface, Resource,
} from '@comet-cli/types';
import { Action } from '../types';
import { getOperationName, JsonSchemaTransformer } from '@comet-cli/utils';
import { emptyDir, ensureDir, rmdir, writeJSONSync } from 'fs-extra';
import { join } from 'path';

export default class JsonSchemaPlugin implements PluginInterface {
  /**
   * Execute the json schema plugin.
   * @param model
   * @param config
   * @param logger
   */
  public async execute(model: ApiModel, config: CommandConfig, logger: LoggerInterface): Promise<void> {
    const actions: Action[] = [];
    for (const group of model.groups) {
      for (const resource of group.resources) {
        actions.push(...this.generateSchemas(resource));
      }
    }
    for (const resource of model.resources) {
      actions.push(...this.generateSchemas(resource));
    }
    const outputDir = config.output;
    await ensureDir(join(outputDir, 'requests'));
    await emptyDir(join(outputDir, 'requests'));
    await ensureDir(join(outputDir, 'responses'));
    await emptyDir(join(outputDir, 'responses'));
    await this.exportSchemas(actions, outputDir);
  }

  /**
   * Generate schemas for a given API resource.
   * @param resource
   */
  protected generateSchemas(resource: Resource): Action[] {
    const actions: Action[] = [];
    for (const operation of resource.operations) {
      // Build schemas from requests
      if (operation.request && operation.request.body) {
        const bodies = operation.request.body;
        const action = this.createFromMediaTypes(bodies, resource.path, operation.method, 'request');
        if (action) {
          actions.push(action);
        }
      }
      // Build schemas from successful responses (2xx code)
      if (operation.responses) {
        for (const code of Object.keys(operation.responses)) {
          if (code.startsWith('2') === true && operation.responses[code].body) {
            const bodies = operation.responses[code].body;
            const action = this.createFromMediaTypes(bodies, resource.path, operation.method, 'response');
            if (action) {
              actions.push(action);
            }
          }
        }
      }
    }

    return actions;
  }

  /**
   * Create transformed JSON Schema definitions from media types map.
   * @param bodies
   * @param path
   * @param method
   * @param operation
   */
  protected createFromMediaTypes(
    bodies: Bodies,
    path: string,
    method: string,
    operation: 'request' | 'response',
  ): Action | null {
    let action: Action = null;
    for (const mime of Object.keys(bodies)) {
      if (mime.includes('json')) {
        if (bodies[mime].schema) {
          const schema = JsonSchemaTransformer.execute(bodies[mime].schema);
          action = {
            schema,
            path: path,
            method: method,
            operation: operation,
            name: getOperationName(path, method),
          };
        }
      }
    }
    return action;
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
      const filename = this.getFilePath(action.name, action.operation);
      writeJSONSync(join(outputDir, filename), action.schema, { spaces: 4 });
      if (action.operation === 'request') {
        hasRequests = true;
      }
      if (action.operation === 'response') {
        hasResponses = true;
      }
    });

    // Delete empty directories
    if (hasRequests === false) {
      await rmdir(join(outputDir, 'requests'));
    }
    if (hasResponses === false) {
      await rmdir(join(outputDir, 'responses'));
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
  protected getFilePath(name: string, operation: 'request' | 'response'): string {
    return join(`${operation}s`, `${name}.json`);
  }
}
