import {
  ApiState,
  Groups,
  Operations,
  NavGroup,
  NavOperation,
  Navigation,
} from './types/api';
import { ApiModel, Dict } from '@comet-cli/types';
import data from '../../../../result.json';
import {
  getOperationName,
  getResourceName,
  slugify,
  prettifyOperationName,
  Folders,
  groupOperationsByTagsOrTrie,
} from '@comet-cli/helper-utils';
import OperationTransformer from './transformers/OperationTransformer';
import GroupTransformer from './transformers/GroupTransformer';
import NavGroupTransformer from './transformers/NavGroupTransformer';
import NavOperationTransformer from './transformers/NavOperationTransformer';
const showdown = require('showdown');

const converter = new showdown.Converter({ tables: true });

export default class Transformer {
  public static execute(): ApiState {
    const operations: Operations = {};
    const operationIds: string[] = [];
    const groups: Groups = {};
    const groupIds: string[] = [];
    const slugs: Dict<number> = {};
    const model: ApiModel = <ApiModel>data;

    const folders: Folders = groupOperationsByTagsOrTrie(model, { group_by: 'resources' });

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

    const name = model.info.name;
    const description = model.info.description ? converter.makeHtml(model.info.description) : '';
    const navigation = this.getNavigation(folders);

    return { name, description, groups, groupIds, operations, operationIds, navigation };
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
