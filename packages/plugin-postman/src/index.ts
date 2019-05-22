import {
  ApiModel,
  CommandConfig,
  LoggerInterface,
  PluginInterface,
} from '@comet-cli/types';
import { PostmanCollection } from '../types';
import { ensureDir, writeFile } from 'fs-extra';
import { join } from 'path';
import { transformInformation } from './transformers/information';
import { transformVariables } from './transformers/variables';
import { createItems } from './transformers/operations';
import { groupOperationsByTrie } from '@comet-cli/helper-utils';

export default class PostmanPlugin implements PluginInterface {
  async execute(model: ApiModel, config: CommandConfig, logger: LoggerInterface): Promise<void> {
    const collection: PostmanCollection = {
      info: transformInformation(model),
      variable: transformVariables(model),
      item: createItems(model),
    };

    const folders = groupOperationsByTrie(model, { flatten: false });
    await writeFile('folders.json', JSON.stringify(folders, null, 2));

    const path = join(config.output, 'postman.json');
    await ensureDir(config.output);
    await writeFile(path, JSON.stringify(collection, null, 2));
  }
}
