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
    resources.push(...group.resources);
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

export const groupOperationsByTags = (model: ApiModel): {[tag: string]: EnhancedOperation[]} | undefined => {
  const operations = getAllOperationsWithUris(model);
  const tags = {};
  let count = 0;
  for (const operation of operations) {
    if (operation.tags && operation.tags.length > 0) {
      const tag = operation.tags[0];
      if (tags[tag]) {
        tags[tag].push(operation);
      } else {
        tags[tag] = [operation];
      }
      count += 1;
    }
  }
  // We can only group by tags if all operations have a tag set
  if (count === operations.length) {
    return tags;
  }
  return undefined;
};
