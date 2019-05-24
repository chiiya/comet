import {
  ApiModel,
  CommandConfig,
  LoggerInterface,
  PluginInterface, PostmanPluginConfig,
} from '@comet-cli/types';
import { PostmanCollection } from '../types';
import { ensureDir, writeFile } from 'fs-extra';
import { join } from 'path';
import { transformInformation } from './transformers/information';
import { transformVariables } from './transformers/variables';
import { createItems } from './transformers/operations';

export default class PostmanPlugin implements PluginInterface {
  async execute(model: ApiModel, config: PostmanPluginConfig, logger: LoggerInterface): Promise<void> {
    const collection: PostmanCollection = {
      info: transformInformation(model),
      variable: transformVariables(model),
      item: createItems(model, config),
    };
    const output = config.output || './';
    const path = join(output, 'postman.json');
    await ensureDir(output);
    await writeFile(path, JSON.stringify(collection, null, 2));
  }

  public name(): string {
    return 'postman';
  }
}
