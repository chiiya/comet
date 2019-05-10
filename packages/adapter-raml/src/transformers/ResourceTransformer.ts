import Specification from '../Specification';
import { Resource } from '@comet-cli/types';
import ParameterTransformer from './ParameterTransformer';

export default class ResourceTransformer {
  public static execute(spec: Specification): Resource[] {
    const resources: Resource[] = [];
    const specResources = spec.api.allResources() || [];
    for (const resource of specResources) {
      const description = resource.description();
      const parameters = resource.uriParameters();
      resources.push({
        name: resource.displayName(),
        description: description ? description.value() : null,
        path: resource.completeRelativeUri(),
        parameters: ParameterTransformer.execute(spec, parameters),
        operations: [],
      });
    }
    return resources;
  }
}
