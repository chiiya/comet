import {
  ApiModel,
  Bodies,
  Body,
  Dict,
  Operation,
  Parameter,
  Resource,
  Server,
} from '@comet-cli/types';

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

export const getResolvedServerUrl = (server: Server): string => {
  let uri = server.uri;
  // Replace variables with a default or enum value, if possible.
  if (server.variables) {
    for (const name of Object.keys(server.variables)) {
      const variable = server.variables[name];
      if (variable.default !== undefined) {
        uri = uri.replace(`{${name}}`, variable.default);
      } else if (variable.enum && variable.enum.length > 0) {
        uri = uri.replace(`{${name}}`, variable.enum[0]);
      }
    }
  }
  uri = uri.replace(/^\/\//, 'http://');

  return uri;
};

export const getJsonBody = (bodies: Bodies): Body | undefined => {
  const types = Object.keys(bodies);
  const jsonType = types.find(type => type.includes('json'));
  if (jsonType !== undefined) {
    return bodies[jsonType];
  }
};

export const resolveExampleUri = (
  uri: string,
  resourceParams: Parameter[],
  operationParams: Parameter[],
): string => {
  let url = uri;
  const foundParams: Dict<Parameter> = {};
  for (const param of resourceParams) {
    if (param.location === 'path') {
      foundParams[param.name] = param;
    }
  }
  for (const param of operationParams) {
    if (param.location === 'path') {
      foundParams[param.name] = param;
    }
  }
  for (const name of Object.keys(foundParams)) {
    const param = foundParams[name];
    const regex = new RegExp(`{${name}}`, 'gi');
    if (param.example !== undefined) {
      url = url.replace(regex, param.example);
    } else {
      url = url.replace(regex, ':$1');
    }
  }

  return url;
};
