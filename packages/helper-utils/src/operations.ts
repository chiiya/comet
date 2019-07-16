import { ApiModel, Dict, Operation, Resource } from '@comet-cli/types';
import { getAllResources, getOperationParameters } from './model';
import { Node, Trie } from './trie';
import { file } from 'babel-types';

export type EnhancedOperation = Operation & {
  uri: string;
};

export interface Group {
  name: string;
  description?: string;
  groups: Group[];
  operations: EnhancedOperation[];
  slug?: string;
}

export interface Folders {
  groups: Group[];
  operations: EnhancedOperation[];
}

export interface GroupOptions {
  group_by?: 'resources' | 'tags' | 'trie';
  flatten?: boolean;
}

/**
 * Get an array of all API operations with their URI and resolved parameters.
 * @param model
 */
export const getAllEnhancedOperations = (model: ApiModel): EnhancedOperation[] => {
  const operations: EnhancedOperation[] = [];
  const resources = getAllResources(model);
  for (const resource of resources) {
    for (const operation of resource.operations) {
      operations.push(getEnhancedOperation(resource, operation));
    }
  }

  return operations;
};

/**
 * Enhance an operation with merged parameters and resource URI.
 * @param resource
 * @param operation
 */
export const getEnhancedOperation = (resource: Resource, operation: Operation): EnhancedOperation => {
  return {
    ...operation,
    parameters: getOperationParameters(resource, operation),
    uri: resource.path,
  };
};

/**
 * Group operations by resources (and resource groups).
 * @param model
 * @param options
 */
export const groupOperationsByResources = (model: ApiModel, options: GroupOptions = {}): Folders => {
  const config: GroupOptions = Object.assign({
    flatten: false,
  }, options);
  const folders: Folders = {
    groups: [],
    operations: [],
  };
  for (const group of model.groups) {
    const items = transformResources(group.resources, config);
    folders.groups.push({
      name: group.name,
      description: group.description,
      groups: items.groups,
      operations: items.operations,
    });
  }
  const items = transformResources(model.resources, config);
  folders.groups.push(...items.groups);
  folders.operations.push(...items.operations);
  return folders;
};

/**
 * Get folder group for a given resource.
 * @param resources
 * @param options
 */
const transformResources = (resources: Resource[], options: GroupOptions): Folders => {
  const groups: Dict<Group | null> = {};
  const operations: EnhancedOperation[] = [];
  const paths = resources.map(resource => resource.path);
  for (const path of paths) {
    groups[path] = null;
  }

  for (const resource of resources) {
    const items: EnhancedOperation[] = [];
    for (const operation of resource.operations) {
      items.push(getEnhancedOperation(resource, operation));
    }
    const endsWithParameter = /.*{.+}\/?$/.test(resource.path);
    const pathWithoutParameter = resource.path.replace(/\/{[^}]+}\/?$/, '');
    if (endsWithParameter && groups[pathWithoutParameter]) {
      groups[pathWithoutParameter]!.operations.push(...items);
    } else {
      groups[resource.path] = {
        name: resource.name || resource.path,
        description: resource.description,
        groups: [],
        operations: items,
      };
    }
  }
  // @ts-ignore
  const reducedGroups: Group[] = Object.values(groups).filter(group => group !== null);
  const filtered: Group[] = [];
  for (const [index, group] of reducedGroups.entries()) {
    // Only one operation
    if (group.operations.length === 1 && group.groups.length === 0) {
      operations.push(group.operations[0]);
    } else {
      filtered.push(group);
    }
  }

  return {
    groups: filtered,
    operations: operations,
  };
};

/**
 * Group all API operations by tags (assumes that only tag per operation is used).
 * Operations without tags are grouped directly under `operations`.
 * @param model
 */
export const groupOperationsByTags = (model: ApiModel): Folders => {
  const folders: Folders = {
    groups: [],
    operations: [],
  };
  const tags: Dict<EnhancedOperation[]> = {};
  const operations = getAllEnhancedOperations(model);
  for (const operation of operations) {
    if (operation.tags && operation.tags.length > 0) {
      const tag = operation.tags[0];
      if (tags[tag]) {
        tags[tag].push(operation);
      } else {
        tags[tag] = [operation];
      }
    } else {
      folders.operations.push(operation);
    }
  }

  for (const tag of Object.keys(tags)) {
    const operations = tags[tag];
    folders.groups.push({
      name: tag,
      operations: operations,
      groups: [],
    });
  }

  return folders;
};

/**
 * Group operations by trie structure.
 * @param model
 * @param options
 */
export const groupOperationsByTrie = (model: ApiModel, options: GroupOptions = {}): Folders => {
  const config: GroupOptions = Object.assign({
    flatten: false,
  }, options);
  const folders: Folders = {
    groups: [],
    operations: [],
  };
  // Group by resource groups, then resource trie
  if (model.groups && model.groups.length > 0) {
    for (const group of model.groups) {
      const subFolders = getFoldersFromResources(group.resources, config);
      folders.groups.push({
        name: group.name,
        description: group.description,
        groups: subFolders.groups,
        operations: subFolders.operations,
      });
    }
  }
  const subFolders = getFoldersFromResources(model.resources, config);
  folders.groups.push(...subFolders.groups);
  folders.operations.push(...subFolders.operations);

  return folders;
};

/**
 * Group operations either by tags or trie.
 * Always returns a folder structure.
 * @param model
 * @param options
 */
export const groupOperations = (model: ApiModel, options: GroupOptions = {}): Folders => {
  if (options.group_by !== undefined) {
    switch (options.group_by) {
      case 'resources':
        return groupOperationsByResources(model, options);
      case 'tags':
        return groupOperationsByTags(model);
      case 'trie':
        return groupOperationsByTrie(model, options);
    }
  }
  const tagFolders = groupOperationsByTags(model);
  if (tagFolders.groups.length > 0) {
    return tagFolders;
  }
  return groupOperationsByTrie(model, options);
};

export const createResourceTrie = (resources: Resource[]): Trie => {
  const trie = new Trie(new Node({
    path: '/',
    operations: [],
  }));
  for (const resource of resources) {
    // Remove leading slash
    const path = resource.path.replace(/^\/*/, '');
    const segments = path.split('/');
    let currentNode = trie.root;
    for (const segment of segments) {
      if (!currentNode.children[segment]) {
        currentNode.addChildren(segment, new Node({
          path: segment.replace(/{([a-zA-Z0-9\-_]+)}/g, ':$1'),
          name: resource.name,
          description: resource.description,
          operations: [],
        }));
      }
      currentNode = currentNode.children[segment];
      currentNode.operationCount += resource.operations.length;
    }
    for (const operation of resource.operations) {
      currentNode.addOperation(getEnhancedOperation(resource, operation));
    }
  }
  return trie;
};

const convertNodeToGroupOrOperation = (node: Node): { group?: Group, operation?: EnhancedOperation } => {
  // Only create a folder if it has more than 1 request in its subtree.
  if (node.operationCount > 1) {
    const group: Group = {
      name: node.name || node.path,
      description: node.description,
      groups: [],
      operations: [],
    };

    for (const operation of node.operations) {
      group.operations.push(operation);
    }

    for (const childNode of Object.values(node.children)) {
      if (childNode.operationCount > 0) {
        const result = convertNodeToGroupOrOperation(childNode);
        if (result.group) {
          group.groups.push(result.group);
        } else if (result.operation) {
          group.operations.push(result.operation);
        }
      }
    }

    return {
      group: group,
    };
  }

  // It only has 1 direct operation of its own
  const operations = [];
  for (const operation of node.operations) {
    operations.push(operation);
  }

  for (const childNode of Object.values(node.children)) {
    if (childNode.operationCount > 0) {
      const result = convertNodeToGroupOrOperation(childNode);
      if (result.operation) {
        operations.push(result.operation);
      }
    }
  }
  return {
    operation: operations[0],
  };
};

const getFoldersFromResources = (resources: Resource[], options: GroupOptions): Folders => {
  const groups: Group[] = [];
  const operations: EnhancedOperation[] = [];
  const trie = createResourceTrie(resources);
  for (const node of Object.values(trie.root.children)) {
    if (node.operationCount > 0) {
      const result = convertNodeToGroupOrOperation(node);
      if (result.group) {
        groups.push(result.group);
      } else if (result.operation) {
        operations.push(result.operation);
      }
    }
  }
  if (options.flatten === true) {
    for (const item of groups) {
      // Only flatten if
      // - It only has _one_ sub-group
      // - That sub-group only contains operations, not other groups
      if (item.groups.length !== 1 || item.groups[0].groups.length !== 0) {
        continue;
      }
      item.operations.push(...item.groups[0].operations);
      item.groups = [];
    }
  }
  return {
    groups: groups,
    operations: operations,
  };
};
