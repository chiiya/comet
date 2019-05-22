import {
  ApiState,
  DocOperation,
  Example,
  Groups,
  Operations,
  Resources,
  DocResource, DocHeader, DocResponses, NavGroup, NavOperation, Navigation,
} from './types/api';
import { ApiModel, Bodies, Operation, Resource } from '@comet-cli/types';
import data from '../../../../result.json';
import {
  getResolvedServerUrl,
  getJsonBody,
  resolveExampleUri,
  getOperationName,
  getResourceName,
  slugify,
  getOperationParameters,
  getHumanReadableType, prettifyOperationName,
} from '@comet-cli/helper-utils';
const uuidv4 = require('uuid/v4');
const showdown = require('showdown');
const httpSnippet = require('httpsnippet');

const converter = new showdown.Converter({ tables: true });

export default class Transformer {
  public static execute(): ApiState {
    const resources: Resources = {};
    const resourceIds: string[] = [];
    let operations: Operations = {};
    const groups: Groups = {};
    const groupIds: string[] = [];
    const api: ApiModel = <ApiModel>data;
    for (const resource of api.resources) {
      const transformedOperations = this.transformOperations(api, resource);
      const keys = Object.keys(transformedOperations);
      const transformedResource = this.transformResource(resource, keys);
      resources[transformedResource.id] = transformedResource;
      resourceIds.push(transformedResource.id);
      operations = { ...operations, ...transformedOperations };
    }
    for (const group of api.groups) {
      const id = uuidv4();
      const ids: string[] = [];
      for (const resource of group.resources) {
        const transformedOperations = this.transformOperations(api, resource);
        const keys = Object.keys(transformedOperations);
        const transformedResource = this.transformResource(resource, keys);
        resources[transformedResource.id] = transformedResource;
        operations = { ...operations, ...transformedOperations };
        ids.push(transformedResource.id);
      }
      groups[id] = { ...group, resources: ids, link: slugify(group.name) };
      groupIds.push(id);
    }

    const name = api.info.name;
    const description = api.info.description ? converter.makeHtml(api.info.description) : '';
    const navigation = this.getNavigation(api);

    return { name, description, resources, resourceIds, operations, groups, groupIds, navigation };
  }

  protected static getNavigation(model: ApiModel): Navigation {
    const navItems: NavGroup[] = [];
    for (const group of model.groups) {
      const items: NavGroup[] = [];
      for (const resource of group.resources) {
        const subItems: NavOperation[] = [];
        for (const operation of resource.operations) {
          subItems.push({
            name: operation.name || prettifyOperationName(resource.path, operation.method),
            link: getOperationName(resource.path, operation.method),
            method: operation.method,
          });
        }
        items.push({
          name: resource.name || resource.path,
          link: getResourceName(resource.path),
          items: [],
          operations: subItems,
        });
      }
      navItems.push({
        name: group.name,
        link: slugify(group.name),
        items: items,
        operations: [],
      });
    }
    for (const resource of model.resources) {
      const subItems: NavOperation[] = [];
      for (const operation of resource.operations) {
        subItems.push({
          name: operation.name || prettifyOperationName(resource.path, operation.method),
          link: getOperationName(resource.path, operation.method),
          method: operation.method,
        });
      }
      navItems.push({
        name: resource.name || resource.path,
        link: getResourceName(resource.path),
        items: [],
        operations: subItems,
      });
    }
    return { items: navItems, operations: [] };
  }

  protected static transformResource(resource: Resource, operationIds: string[]): DocResource {
    return {
      ... resource,
      parameters: undefined,
      id: uuidv4(),
      link: getResourceName(resource.path),
      description: resource.description ? converter.makeHtml(resource.description) : undefined,
      operations: operationIds,
    };
  }

  protected static transformOperations(api: ApiModel, resource: Resource): Operations {
    const operations: Operations = {};
    for (const operation of resource.operations) {
      const snippet = this.createSnippet(api, resource, operation);
      const link = getOperationName(resource.path, operation.method);
      const requestHeaders: DocHeader[] = [];
      if (operation.request && operation.request.headers) {
        for (const header of operation.request.headers) {
          requestHeaders.push({ ...header, displayName: getHumanReadableType(header.schema) });
        }
      }
      const responses: DocResponses = {};
      if (operation.responses && Object.keys(operation.responses).length > 0) {
        const codes = Object.keys(operation.responses);
        for (const code of codes) {
          const response = operation.responses[code];
          const headers: DocHeader[] = [];
          for (const header of response.headers) {
            headers.push({ ...header, displayName: getHumanReadableType(header.schema) });
          }
          responses[code] = { ...response, headers };
        }
      }
      const op: DocOperation = { ...operation, snippet, link, requestHeaders, responses };
      delete op.transactions;
      const id = uuidv4();
      if (operation.description) {
        op.description = converter.makeHtml(operation.description);
      }
      op.exampleResponse = this.getExampleResponse(operation);
      op.exampleRequest = this.getExampleRequest(operation);
      const parameters = getOperationParameters(resource, operation);
      for (const parameter of parameters) {
        parameter.displayType = getHumanReadableType(parameter.schema);
      }
      op.parameters = parameters;
      operations[id] = op;
    }
    return operations;
  }

  protected static createSnippet(api: ApiModel, resource: Resource, operation: Operation): string {
    const snippet = new httpSnippet(this.createHar(api, resource, operation));
    // generate Shell: cURL output
    return snippet.convert('shell', 'curl', {
      indent: '\t',
      short: true,
    });
  }

  protected static createHar(api: ApiModel, resource: Resource, operation: Operation): any {
    const server = api.info.servers.length > 0 ? getResolvedServerUrl(api.info.servers[0]) : '';
    const headers = [];
    if (operation.request && operation.request.headers) {
      for (const header of operation.request.headers) {
        if (header.name.toLowerCase() !== 'accept') {
          headers.push({
            name: header.name,
            value: header.example ? header.example : '<value>',
          });
        }
      }
    }
    const postData: any = {};
    if (operation.request && Object.keys(operation.request.body || {}).length > 0) {
      const body = getJsonBody(operation.request.body || {});
      if (body) {
        postData.mimeType = body.mediaType;
        let example = body.examples ? body.examples[0] : undefined;
        if (example) {
          if (typeof example === 'object') {
            example = JSON.stringify(example);
          } else {
            example = JSON.stringify(JSON.parse(example));
          }
          postData.text = example;
        }
      }
    }
    const url = new URL(resolveExampleUri(resource.path, resource.parameters, operation.parameters), server);
    return {
      headers,
      postData: postData && postData.text ? postData : undefined,
      method: operation.method.toUpperCase(),
      url: url.href,
    };
  }

  protected static getExampleResponse(operation: Operation): Example | undefined {
    if (operation.responses === undefined || Object.keys(operation.responses).length === 0) {
      return undefined;
    }
    const responses = Object.values(operation.responses);
    const response = responses.find(item => item.statusCode === 'default' || Number(item.statusCode) < 300);
    if (response === undefined || response.body === undefined) {
      return undefined;
    }
    const bodies = response.body;
    return this.getExampleBody(bodies);
  }

  protected static getExampleRequest(operation: Operation): Example | undefined {
    if (
      operation.request === undefined
      || operation.request.body === undefined
      || Object.keys(operation.request.body).length === 0
    ) {
      return undefined;
    }
    const bodies = operation.request.body;
    return this.getExampleBody(bodies);
  }

  protected static getExampleBody(bodies: Bodies): Example | undefined {
    const jsonBody = getJsonBody(bodies);
    if (jsonBody && jsonBody.examples.length > 0) {
      let example = jsonBody.examples[0];
      if (typeof example === 'object') {
        example = JSON.stringify(example, null, 2);
      } else {
        try {
          example = JSON.stringify(JSON.parse(example), null, 2);
        } catch (error) {
          return undefined;
        }
      }
      return {
        lang: 'json',
        example: example,
      };
    }
    const body = Object.values(bodies).find(item => item.examples.length > 0);
    if (body) {
      return {
        lang: body.mediaType ? body.mediaType.replace('application/', '') : '',
        example: body.examples[0],
      };
    }
    return undefined;
  }
}
