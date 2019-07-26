import { Group, slugify } from '@comet-cli/helper-utils';
import { ApiModel, Dict, DocGroup, Groups, Operations } from '@comet-cli/types';
import OperationTransformer from './OperationTransformer';
const uuidv4 = require('uuid/v4');
const showdown = require('showdown');

const converter = new showdown.Converter({ tables: true });

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
      description: group.description ? converter.makeHtml(group.description) : undefined,
      link: slug,
      operations: operationIds,
      groups: groupIds,
    };
  }
}
