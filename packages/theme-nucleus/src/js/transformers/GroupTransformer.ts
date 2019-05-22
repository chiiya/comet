import { Group, slugify } from '@comet-cli/helper-utils';
import { DocGroup, Groups, Operations } from '../types/api';
import { ApiModel, Dict } from '@comet-cli/types';
import OperationTransformer from './OperationTransformer';
const uuidv4 = require('uuid/v4');

export default class GroupTransformer {
  public static execute(
    model: ApiModel,
    group: Group,
    slugs: Dict<number>,
    operations: Operations,
    groups: Groups,
  ): DocGroup {
    let slug = slugify(group.name);
    if (slugs[slug]) {
      slugs[slug] = slugs[slug] + 1;
      slug = `${slug}-${slugs[slug]}`;
    }
    group.slug = slug;
    const operationIds: string[] = [];
    const groupIds: string[] = [];
    for (const operation of group.operations) {
      const transformedOperation = OperationTransformer.execute(model, operation);
      operations[transformedOperation.id] = transformedOperation;
      operationIds.push(transformedOperation.id);
    }
    for (const subGroup of group.groups) {
      const transformedGroup = GroupTransformer.execute(model, subGroup, slugs, operations, groups);
      groups[transformedGroup.id] = transformedGroup;
      groupIds.push(transformedGroup.id);
    }
    return {
      id: uuidv4(),
      name: group.name,
      description: group.description,
      link: slug,
      operations: operationIds,
      groups: groupIds,
    };
  }
}
