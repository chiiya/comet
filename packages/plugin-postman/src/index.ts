import {
  ApiModel,
  Authentication, Body,
  CommandConfig,
  LoggerInterface, Operation,
  PluginInterface,
  Resource,
} from '@comet-cli/types';
import {
  PostmanCollection,
  PostmanFolder, PostmanHeader,
  PostmanInformation,
  PostmanItem, PostmanRequest,
  PostmanVariable,
} from '../types';
import { prettifyOperationName } from '@comet-cli/helper-utils';
import { ensureDir, writeFile } from 'fs-extra';
import { join } from 'path';
const uuidv4 = require('uuid/v4');

export default class PostmanPlugin implements PluginInterface {
  async execute(model: ApiModel, config: CommandConfig, logger: LoggerInterface): Promise<void> {
    const collection: PostmanCollection = {
      info: this.getInformation(model),
      variable: this.getVariables(model),
      item: this.getItems(model),
    };

    const path = join(config.output, 'postman.json');

    await ensureDir(config.output);
    await writeFile(path, JSON.stringify(collection, null, 2));
  }

  protected getInformation(model: ApiModel): PostmanInformation {
    return {
      name: model.info.name,
      description: model.info.description,
      version: model.info.version,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _postman_id: uuidv4(),
    };
  }

  protected getVariables(model: ApiModel): PostmanVariable[] {
    const variables: PostmanVariable[] = [];
    // Add URLs as variables
    for (const [index, server] of model.info.servers.entries() || []) {
      let uri = server.uri;
      // Replace variables with their default value, if possible.
      if (server.variables) {
        for (const name of Object.keys(server.variables)) {
          const variable = server.variables[name];
          if (variable.default) {
            uri = uri.replace(`{${name}}`, variable.default);
          }
        }
      }
      variables.push({
        id: uuidv4(),
        key: `url_${index}`,
        value: uri,
        description: server.description,
        type: 'string',
        name: `Server URL ${index}`,
      });
    }
    // Add auth secrets as variables
    if (model.auth) {
      for (const name of Object.keys(model.auth)) {
        const scheme = model.auth[name];
        variables.push(this.getAuthSecret(scheme));
      }
    }

    return variables;
  }

  protected getAuthSecret(auth: Authentication): PostmanVariable {
    return {
      id: uuidv4(),
      key: `auth_${auth.type}`,
      description: auth.description,
      type: 'string',
      name: `Auth secret for ${auth.type.toUpperCase()}`,
    };
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
    const request: PostmanRequest = {
      method: operation.method,
      description: operation.request ? operation.request.description : undefined,
      url: {
        raw: `{{url_0}}${resource.path}`,
        host: '{{url_0}}',
        path: resource.path,
      },
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
          const body = operation.request.body[jsonType];
        } else {
          const type = types[0];
          headers = this.setContentTypeHeader(headers, type);
          body = operation.request.body[type];
        }
      }

      if (body && body.examples.length > 0) {
        request.body = {
          mode: 'raw',
          raw: body.examples[0],
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
}
