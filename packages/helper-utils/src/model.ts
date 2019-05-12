import { ApiModel, Operation, Resource } from '@comet-cli/types';

export type EnhancedOperation = Operation & {
  uri: string;
};

/**
 * Get an array of all API resources.
 * @param model
 */
export const getAllResources = (model: ApiModel): Resource[] => {
  const resources: Resource[] = model.resources;
  for (const group of model.groups) {
    resources.push(...resources);
  }

  return resources;
};

/**
 * Get an array of all API operations with their URI.
 * @param model
 */
export const getAllOperationsWithUris = (model: ApiModel): EnhancedOperation[] => {
  const operations: EnhancedOperation[] = [];
  const resources = getAllResources(model);
  for (const resource of resources) {
    for (const operation of resource.operations) {
      operations.push({ ...operation, uri: resource.path });
    }
  }

  return operations;
};
