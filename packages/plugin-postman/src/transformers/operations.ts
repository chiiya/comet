import {
  ApiModel,
  Body,
  CommandConfig,
  Parameter, PostmanPluginConfig,
} from '@comet-cli/types';
import {
  PostmanFolder,
  PostmanHeader,
  PostmanItem,
  PostmanQueryParam,
  PostmanRequest,
  PostmanUrl,
  PostmanVariable,
} from '../../types';
import {
  Folders,
  Group, groupOperations, GroupOptions, EnhancedOperation,
  prettifyOperationName,
} from '@comet-cli/helper-utils';

export const createItems = (model: ApiModel, config: PostmanPluginConfig): (PostmanItem | PostmanFolder)[] => {
  const items: (PostmanItem | PostmanFolder)[] = [];
  const options: GroupOptions = {
    group_by: config.group_by,
    flatten: config.flatten || false,
  };
  const folders: Folders = groupOperations(model, options);

  for (const group of folders.groups) {
    items.push(transformGroupToFolder(group));
  }

  for (const operation of folders.operations) {
    items.push(createRequestItem(operation));
  }

  return items;
};

const transformGroupToFolder = (group: Group): PostmanFolder => {
  const items: (PostmanItem | PostmanFolder)[] = [];
  for (const subGroup of group.groups) {
    items.push(transformGroupToFolder(subGroup));
  }
  for (const operation of group.operations) {
    items.push(createRequestItem(operation));
  }
  return {
    name: group.name,
    description: group.description,
    item: items,
  };
};

const createRequestItem = (operation: EnhancedOperation): PostmanItem => {
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
  const uri = resolveUri(operation);
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
    name: operation.name || prettifyOperationName(operation.uri, operation.method),
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

const resolveUri = (operation: EnhancedOperation): PostmanUrl => {
  let uri = operation.uri;
  uri = replaceParameterNotation(uri);
  const requiredQueryParams = [];
  const foundQueryParams = {};
  for (const param of operation.parameters) {
    if (param.location === 'query' && param.required) {
      requiredQueryParams.push(param);
      foundQueryParams[param.name] = true;
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

  const pathSegments = uri.split('/');

  return {
    raw: `{{url}}${uri}`,
    host: '{{url}}',
    path: pathSegments,
    query: resolveQueryParameters(operation),
    variable: resolvePathParameters(operation),
  };
};

const resolveQueryParameters = (operation: EnhancedOperation): PostmanQueryParam[] => {
  const params: PostmanQueryParam[] = [];
  const queryParams: {[name: string]: Parameter} = {};
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

const resolvePathParameters = (operation: EnhancedOperation): PostmanVariable[] => {
  const params: PostmanVariable[] = [];
  const pathParams: {[name: string]: Parameter} = {};
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
