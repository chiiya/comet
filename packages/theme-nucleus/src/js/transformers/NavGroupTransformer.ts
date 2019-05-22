import { Group } from '@comet-cli/helper-utils';
import { NavGroup, NavOperation } from '../types/api';
import NavOperationTransformer from './NavOperationTransformer';

export default class NavGroupTransformer {
  public static execute(group: Group): NavGroup {
    const groups: NavGroup[] = [];
    const operations: NavOperation[] = [];
    for (const subGroup of group.groups) {
      groups.push(NavGroupTransformer.execute(subGroup));
    }
    for (const operation of group.operations) {
      operations.push(NavOperationTransformer.execute(operation));
    }
    const slug = <string>group.slug;
    return {
      name: group.name,
      link: slug,
      groups: groups,
      operations: operations,
    };
  }
}
