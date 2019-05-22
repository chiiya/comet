import { ApiModel, Dict, Operation, Parameter, Resource } from '@comet-cli/types';
import { getAllResources, getOperationParameters } from './model';
import { Node, Trie } from './trie';

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

export interface TrieOptions {
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

export const groupOperationsByTrie = (model: ApiModel, options: TrieOptions = {}): Folders => {
  const config: TrieOptions = Object.assign({
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
export const groupOperationsByTagsOrTrie = (model: ApiModel, options: TrieOptions = {}): Folders => {
  const tagFolders = groupOperationsByTags(model);
  if (tagFolders.groups.length > 0) {
    return tagFolders;
  }
  return groupOperationsByTrie(model, options);
};

export const createResourceTrie = (resources: Resource[]): Trie => {
  const trie = new Trie(new Node({
    type: 'item',
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
          type: 'group',
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
  return {
    operation: node.operations[0],
  };
};

const getFoldersFromResources = (resources: Resource[], options: TrieOptions): Folders => {
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
