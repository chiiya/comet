import Specification from '../Specification';
import {
  ApiBlueprintAdapterConfig,
  Authentication,
  ResourceGroup,
} from '@comet-cli/types';
import { ApiBlueprintCopy } from '../../types/blueprint';
import ResourceTransformer from './ResourceTransformer';

export default class ResourceGroupTransformer {
  /**
   * Parse named resource groups from the AST. Exclude default (unnamed) resource group,
   * and optionally the `Root` group.
   * @param spec
   * @param config
   * @param auth
   */
  public static execute(
    spec: Specification,
    config: ApiBlueprintAdapterConfig,
    auth: Authentication | undefined,
  ): ResourceGroup[] {
    const resourceGroups: ResourceGroup[] = [];
    // Only resource groups will have the `attributes` property. Unnamed resource groups
    // will not have a name. To allow mixing grouped resources and non-grouped resources,
    // we will ungroup the `Root` resource group, if present.
    const astGroups = spec.ast.content.filter((item) => {
      const isGroup = item.content.length > 0
        && item.content.find(item => item.element === 'resource') !== undefined
        && item.attributes
        && item.attributes.name !== '';

      return config.ungroup_root === true ? (isGroup && item.attributes && item.attributes.name !== 'Root') : isGroup;
    });
    for (const group of astGroups) {
      const description = <ApiBlueprintCopy>group.content.find((item) => {
        return item.element === 'copy';
      });
      resourceGroups.push({
        name: group.attributes ? group.attributes.name : '',
        description: description !== undefined ? description.content : undefined,
        resources: ResourceTransformer.transformFromResourceGroup(group.content, auth),
      });
    }
    return resourceGroups;
  }
}
