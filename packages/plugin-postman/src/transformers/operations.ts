import { ApiModel, Body, Operation, Parameter, Resource } from '@comet-cli/types';
import {
  PostmanFolder,
  PostmanHeader,
  PostmanItem,
  PostmanQueryParam,
  PostmanRequest,
  PostmanUrl,
  PostmanVariable,
} from '../../types';
import { Node, Trie } from '../trie';
import { prettifyOperationName } from '@comet-cli/helper-utils';

export const createItems = (model: ApiModel): (PostmanItem | PostmanFolder)[] => {
  const folders: (PostmanItem | PostmanFolder)[] = [];
  // Group by resource groups, then resource trie
  if (model.groups && model.groups.length > 0) {
    for (const group of model.groups) {
      const items = [];
      const trie = createResourceTrie(group.resources);
      for (const node of Object.values(trie.root.children)) {
        if (node.requestCount > 0) {
          const folderOrItem = convertNodeToFolderOrItem(node);
          if (folderOrItem !== undefined) {
            items.push(folderOrItem);
          }
        }
      }
      folders.push({
        name: group.name,
        description: group.description,
        item: items,
      });
    }
  }
  const trie = createResourceTrie(model.resources);
  // await writeFile('trie.json', JSON.stringify(trie, null, 2));
  for (const node of Object.values(trie.root.children)) {
    if (node.requestCount > 0) {
      folders.push(convertNodeToFolderOrItem(node));
    }
  }
  return folders;
};

const createResourceTrie = (resources: Resource[]): Trie => {
  const trie = new Trie(new Node({
    type: 'item',
    path: '/',
    requests: [],
  }));
  for (const resource of resources) {
    // Remove leading slash
    const path = resource.path.startsWith('/') ? resource.path.substr(1) : resource.path;
    const segments = path.split('/');
    let currentNode = trie.root;
    for (const segment of segments) {
      if (!currentNode.children[segment]) {
        currentNode.addChildren(segment, new Node({
          type: 'folder',
          path: segment.replace(/{([a-zA-Z0-9\-_]+)}/g, ':$1'),
          name: resource.name,
          description: resource.description,
          requests: [],
        }));
      }
      currentNode = currentNode.children[segment];
      currentNode.requestCount += resource.operations.length;
    }
    for (const operation of resource.operations) {
      currentNode.addRequest(createRequestItem(resource, operation));
    }
  }
  return trie;
};

const convertNodeToFolderOrItem = (node: Node): PostmanFolder | PostmanItem => {
  // Only create a folder if it has more than 1 request in its subtree.
  if (node.requestCount > 1) {
    const folder: PostmanFolder = {
      name: node.name || node.path,
      description: node.description,
      item: [],
    };

    for (const request of node.requests) {
      folder.item!.push(request);
    }

    for (const childNode of Object.values(node.children)) {
      if (childNode.requestCount > 0) {
        folder.item!.push(convertNodeToFolderOrItem(childNode));
      }
    }

    return folder;
  }

  // It only has 1 direct of its own
  return node.requests[0];
};

const createRequestItem = (resource: Resource, operation: Operation): PostmanItem => {
  let headers: PostmanHeader[] = [];
  if (operation.request && operation.request.headers.length > 0) {
    for (const header of operation.request.headers) {
      headers.push({
        key: header.name,
        value: header.example,
        description: header.description,
      });
    }
  }
  const uri = resolveUri(resource, operation);
  const request: PostmanRequest = {
    method: operation.method,
    description: operation.request ? operation.request.description : undefined,
    url: uri,
  };
  if (operation.request && operation.request.body) {
    const types = Object.keys(operation.request.body);
    let body: Body | undefined = undefined;
    if (types.length === 1) {
      headers = setContentTypeHeader(headers, types[0]);
      body = operation.request.body[types[0]];
    } else {
      const jsonType = types.find(type => type.includes('json'));
      if (jsonType !== undefined) {
        headers = setContentTypeHeader(headers, jsonType);
        body = operation.request.body[jsonType];
      } else {
        const type = types[0];
        headers = setContentTypeHeader(headers, type);
        body = operation.request.body[type];
      }
    }

    if (body && body.examples.length > 0) {
      const example = body.examples[0];
      request.body = {
        mode: 'raw',
        raw: (typeof example === 'object') ? JSON.stringify(example, null, 2) : example,
      };
    }
  }
  if (headers.length > 0) {
    request.header = headers;
  }
  return {
    name: operation.name || prettifyOperationName(resource.path, operation.method),
    description: operation.description,
    request: request,
  };
};

const setContentTypeHeader = (headers: PostmanHeader[], type: string): PostmanHeader[] => {
  const excludedContentType = headers.filter(header => header.key.toLowerCase() !== 'content-type');
  excludedContentType.push({
    key: 'Content-Type',
    value: type,
  });
  return excludedContentType;
};

const resolveUri = (resource: Resource, operation: Operation): PostmanUrl => {
  let uri = resource.path;
  uri = replaceParameterNotation(uri);
  const requiredQueryParams = [];
  const foundQueryParams = {};
  for (const param of operation.parameters) {
    if (param.location === 'query' && param.required) {
      requiredQueryParams.push(param);
      foundQueryParams[param.name] = true;
    }
  }
  for (const param of resource.parameters) {
    if (param.location === 'query' && param.required && foundQueryParams[param.name] === undefined) {
      requiredQueryParams.push(param);
    }
  }

  if (requiredQueryParams.length > 0) {
    let queryString = '?';
    for (const param of requiredQueryParams) {
      queryString += `${param.name}=${param.example ? param.example : ''}&`;
    }
    queryString = queryString.substring(0, queryString.length - 1);
    uri += queryString;
  }

  const path = uri.split('/');

  return {
    raw: `{{url}}${uri}`,
    host: '{{url}}',
    path: path,
    query: resolveQueryParameters(resource, operation),
    variable: resolvePathParameters(resource, operation),
  };
};

const resolveQueryParameters = (resource: Resource, operation: Operation): PostmanQueryParam[] => {
  const params: PostmanQueryParam[] = [];
  const queryParams: {[name: string]: Parameter} = {};
  for (const param of resource.parameters) {
    if (param.location === 'query') {
      queryParams[param.name] = param;
    }
  }
  for (const param of operation.parameters) {
    if (param.location === 'query') {
      queryParams[param.name] = param;
    }
  }
  for (const param of Object.values(queryParams)) {
    params.push({
      key: param.name,
      value: param.example,
      description: param.description,
    });
  }
  return params;
};

const resolvePathParameters = (resource: Resource, operation: Operation): PostmanVariable[] => {
  const params: PostmanVariable[] = [];
  const pathParams: {[name: string]: Parameter} = {};
  for (const param of resource.parameters) {
    if (param.location === 'path') {
      pathParams[param.name] = param;
    }
  }
  for (const param of operation.parameters) {
    if (param.location === 'path') {
      pathParams[param.name] = param;
    }
  }
  for (const param of Object.values(pathParams)) {
    params.push({
      key: param.name,
      value: param.example,
      description: param.description,
    });
  }
  return params;
};

const replaceParameterNotation = (path: string): string => {
  return path
    .replace(/\/{([a-zA-Z0-9\-_]+)}(\/|$)/g, '/:$1$2')
    .replace(/^{([a-zA-Z0-9\-_]+)}:/, '{{$1}}:');
};
