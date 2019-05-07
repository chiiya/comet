import Specification from '../Specification';
import { Operation, Resource } from '@comet-cli/types';
import HeaderTransformer from './HeaderTransformer';
import ParameterTransformer from './ParameterTransformer';
import OperationTransformer from './OperationTransformer';

export default class ResourceTransformer {
  public static execute(spec: Specification) {
    const resources: Resource[] = [];
    for (const path of Object.keys(spec.entity.paths)) {
      const openApiResource = spec.entity.paths[path];
      const params = openApiResource.parameters || [];
      const resourceHeaders = HeaderTransformer.transformFromParameters(spec, params);
      const methods = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      const operations: Operation[] = [];
      for (const key of Object.keys(openApiResource)) {
        if (methods.includes(key) === false) {
          continue;
        }
        const operation = openApiResource[key];
        if (operation) {
          operations.push(OperationTransformer.execute(spec, operation, key, resourceHeaders));
        }
      }
      resources.push({
        path,
        operations,
        name: openApiResource.summary,
        description: openApiResource.description,
        parameters: ParameterTransformer.execute(spec, params),
      });
    }

    return resources;
  }
}
