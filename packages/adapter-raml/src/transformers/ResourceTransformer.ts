import Specification from '../Specification';
import { Authentication, Dict, Resource } from '@comet-cli/types';
import ParameterTransformer from './ParameterTransformer';
import OperationTransformer from './OperationTransformer';

export default class ResourceTransformer {
  public static execute(spec: Specification, auth: Dict<Authentication>): Resource[] {
    const resources: Resource[] = [];
    const specResources = spec.api.allResources() || [];
    for (const resource of specResources) {
      const description = resource.description();
      const parameters = resource.uriParameters();
      resources.push({
        name: resource.displayName(),
        description: description ? description.value() : null,
        path: resource.completeRelativeUri(),
        parameters: ParameterTransformer.execute(spec, parameters, 'path'),
        operations: OperationTransformer.execute(spec, resource.methods(), auth),
      });
    }
    return resources;
  }
}
