import {
  ApiModel,
  Dict,
  ApiState,
  Groups,
  Operations,
  NavGroup,
  NavOperation,
  Navigation, DocumentationPluginConfig,
} from '@comet-cli/types';
import { Folders, groupOperations, getResolvedServerUrl } from '@comet-cli/helper-utils';
import { writeFileSync } from 'fs-extra';
import OperationTransformer from './transformers/OperationTransformer';
import GroupTransformer from './transformers/GroupTransformer';
import NavGroupTransformer from './transformers/NavGroupTransformer';
import NavOperationTransformer from './transformers/NavOperationTransformer';
const showdown = require('showdown');

const converter = new showdown.Converter({ tables: true });

export default class Transformer {
  public static execute(model: ApiModel, config: DocumentationPluginConfig): ApiState {
    const operations: Operations = {};
    const operationIds: string[] = [];
    const groups: Groups = {};
    const groupIds: string[] = [];
    const slugs: Dict<number> = {};

    const folders: Folders = groupOperations(model, { group_by: config.group_by, flatten: config.flatten });
    writeFileSync('trie.json', JSON.stringify(folders, null, 2));

    for (const operation of folders.operations) {
      const transformedOperation = OperationTransformer.execute(model, operation);
      operations[transformedOperation.id] = transformedOperation;
      operationIds.push(transformedOperation.id);
    }

    for (const group of folders.groups) {
      const transformedGroup = GroupTransformer.execute(model, group, slugs, operations, groups);
      groups[transformedGroup.id] = transformedGroup;
      groupIds.push(transformedGroup.id);
    }

    const title = model.info.name;
    const description = model.info.description ? converter.makeHtml(model.info.description) : '';
    const navigation = this.getNavigation(folders);
    const uris: string[] = [];

    for (const [index, server] of (model.info.servers || []).entries()) {
      uris.push(getResolvedServerUrl(server));
    }

    return { title, description, uris, groups, groupIds, operations, operationIds, navigation };
  }

  protected static getNavigation(folders: Folders): Navigation {
    const groups: NavGroup[] = [];
    const operations: NavOperation[] = [];
    for (const group of folders.groups) {
      groups.push(NavGroupTransformer.execute(group));
    }
    for (const operation of folders.operations) {
      operations.push(NavOperationTransformer.execute(operation));
    }
    return { groups, operations };
  }
}
