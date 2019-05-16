import {
  ApiModel,
  Body,
  CommandConfig,
  LoggerInterface, Operation, Parameter,
  PluginInterface,
  Resource,
} from '@comet-cli/types';
import {
  PostmanCollection,
  PostmanFolder, PostmanHeader,
  PostmanItem, PostmanQueryParam, PostmanRequest, PostmanUrl, PostmanVariable,
} from '../types';
import { prettifyOperationName } from '@comet-cli/helper-utils';
import { ensureDir, writeFile } from 'fs-extra';
import { join } from 'path';
import { transformInformation } from './transformers/information';
import { transformVariables } from './transformers/variables';
const uuidv4 = require('uuid/v4');

export default class PostmanPlugin implements PluginInterface {
  async execute(model: ApiModel, config: CommandConfig, logger: LoggerInterface): Promise<void> {
    const collection: PostmanCollection = {
      info: transformInformation(model),
      variable: transformVariables(model),
      item: this.getItems(model),
    };

    const path = join(config.output, 'postman.json');
    await ensureDir(config.output);
    await writeFile(path, JSON.stringify(collection, null, 2));
  }

  protected getItems(model: ApiModel): (PostmanItem | PostmanFolder)[] {
    const folders: PostmanFolder[] = [];
    if (model.groups && model.groups.length > 0) {
      for (const group of model.groups) {
        const items = [];
        for (const resource of group.resources) {
          items.push(this.getResource(resource));
        }
        folders.push({
          name: group.name,
          description: group.description,
          item: items,
        });
      }
    }
    for (const resource of model.resources) {
      folders.push(this.getResource(resource));
    }
    return folders;
  }

  protected getResource(resource: Resource): PostmanFolder {
    const items = [];
    for (const operation of resource.operations) {
      items.push({
        name: operation.name || prettifyOperationName(resource.path, operation.method),
        description: operation.description,
        request: this.getRequest(resource, operation),
      });
    }
    return {
      name: resource.name || resource.path,
      description: resource.description,
      item: items,
    };
  }

  protected getRequest(resource: Resource, operation: Operation): PostmanRequest {
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
    const uri = this.resolveUri(resource, operation);
    const request: PostmanRequest = {
      method: operation.method,
      description: operation.request ? operation.request.description : undefined,
      url: uri,
    };
    if (operation.request && operation.request.body) {
      const types = Object.keys(operation.request.body);
      let body: Body | undefined = undefined;
      if (types.length === 1) {
        headers = this.setContentTypeHeader(headers, types[0]);
        body = operation.request.body[types[0]];
      } else {
        const jsonType = types.find(type => type.includes('json'));
        if (jsonType !== undefined) {
          headers = this.setContentTypeHeader(headers, jsonType);
          body = operation.request.body[jsonType];
        } else {
          const type = types[0];
          headers = this.setContentTypeHeader(headers, type);
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
    return request;
  }

  protected setContentTypeHeader(headers: PostmanHeader[], type: string): PostmanHeader[] {
    const excludedContentType = headers.filter(header => header.key.toLowerCase() !== 'content-type');
    excludedContentType.push({
      key: 'Content-Type',
      value: type,
    });
    return excludedContentType;
  }

  protected resolveUri(resource: Resource, operation: Operation): PostmanUrl {
    let uri = resource.path;
    uri = uri
      .replace(/\/{([a-zA-Z0-9\-_]+)}(\/|$)/g, '/:$1$2')
      .replace(/^{([a-zA-Z0-9\-_]+)}:/, '{{$1}}:');
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
      query: this.resolveQueryParameters(resource, operation),
      variable: this.resolvePathParameters(resource, operation),
    };
  }

  protected resolveQueryParameters(resource: Resource, operation: Operation): PostmanQueryParam[] {
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
  }

  protected resolvePathParameters(resource: Resource, operation: Operation): PostmanVariable[] {
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
  }
}
