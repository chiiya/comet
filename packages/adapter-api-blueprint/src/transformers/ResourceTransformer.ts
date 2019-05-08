import { ApiBlueprintCopy, ApiBlueprintResource } from '../../types/blueprint';
import { Authentication, CommandConfig, Operation, Resource } from '@comet-cli/types';
import * as get from 'lodash/get';
import ParameterTransformer from './ParameterTransformer';
import OperationTransformer from './OperationTransformer';
import Specification from '../Specification';

export default class ResourceTransformer {
  /**
   * Parse resources from the AST.
   * @param content
   * @param auth
   */
  public static transformFromResourceGroup(
    content: (ApiBlueprintResource | ApiBlueprintCopy)[],
    auth: Authentication,
  ): Resource[] {
    const resources: Resource[] = [];
    const astResources = <ApiBlueprintResource[]>content.filter((item) => {
      return item.element === 'resource';
    });
    for (const resource of astResources) {
      const actions = [];
      // API Blueprint lets actions define their own URIs.
      // If the action URI is different from the resource URI (excluding query parameters)
      // there should be a new resource for it.
      for (const action of resource.actions || []) {
        const uri = get(action, 'attributes.uriTemplate');
        if (uri === undefined || uri === '' || uri === null) {
          actions.push(action);
          continue;
        }
        const trimmedUri = uri.replace(/{[?&#+].+}/g, '');
        if (trimmedUri === resource.uriTemplate) {
          actions.push(action);
          continue;
        }
        const existingResource = resources.find(item => item.path === trimmedUri);
        if (existingResource !== undefined) {
          existingResource.operations.push(OperationTransformer.execute(existingResource.path, action, auth));
        } else {
          const operation = OperationTransformer.execute(resource.uriTemplate, action, auth);
          resources.push({
            path: trimmedUri,
            name: null,
            description: null,
            parameters: ParameterTransformer.execute(resource.uriTemplate, resource.parameters),
            operations: [operation],
          });
        }
      }

      // Now parse the operations that actually belong to this resource.
      if (actions.length > 0) {
        const operations: Operation[] = [];
        for (const action of actions) {
          operations.push(OperationTransformer.execute(resource.uriTemplate, action, auth));
        }
        resources.push({
          path: resource.uriTemplate,
          name: resource.name,
          description: resource.description,
          parameters: ParameterTransformer.execute(resource.uriTemplate, resource.parameters),
          // tslint:disable-next-line:object-shorthand-properties-first
          operations,
        });
      }
    }
    return resources;
  }

  /**
   * Parse resources that are grouped within the default resource group.
   * @param spec
   * @param config
   * @param auth
   */
  public static transformFromDefaultGroup(
    spec: Specification,
    config: CommandConfig,
    auth: Authentication,
  ): Resource[] {
    let resources: Resource[] = [];

    const defaultGroup = spec.ast.content.find((item) => {
      return item.content.length > 0
        && item.content.find(item => item.element === 'resource') !== undefined
        && item.hasOwnProperty('attributes') === false;
    });
    const rootGroup = spec.ast.content.find((item) => {
      return item.content.length > 0
        && item.content.find(item => item.element === 'resource') !== undefined
        && item.hasOwnProperty('attributes')
        && item.attributes.name === 'Root';
    });

    if (defaultGroup !== undefined) {
      resources = [...resources, ...this.transformFromResourceGroup(defaultGroup.content, auth)];
    }
    // To allow mixing grouped resources and non-grouped resources, we will ungroup the `Root`
    // resource group, if present.
    if (config.ungroupRoot === true && rootGroup !== undefined) {
      resources = [...resources, ...this.transformFromResourceGroup(rootGroup.content, auth)];
    }

    return resources;
  }
}