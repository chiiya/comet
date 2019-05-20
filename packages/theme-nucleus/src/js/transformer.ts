import { ApiState, EnhancedGroup, Groups, Operations, Resources } from './types/api';
import { ApiModel, Bodies, Operation, Resource } from '@comet-cli/types';
import data from '../../../../result.json';
import { getResolvedServerUrl, getJsonBody, resolveExampleUri } from '@comet-cli/helper-utils';
const uuidv4 = require('uuid/v4');
const showdown = require('showdown');
const httpSnippet = require('httpsnippet');

const converter = new showdown.Converter({ tables: true });

interface Example {
  lang: string;
  example: string | any;
}

export default class Transformer {
  public static execute(): ApiState {
    const resources: Resources = {};
    let operations: Operations = {};
    const groups: Groups = {};
    const api: ApiModel = <ApiModel>data;
    const dataResources: Resource[] = api.resources;
    for (const resource of dataResources) {
      const id = uuidv4();
      if (resource.description) {
        resource.description = converter.makeHtml(resource.description);
      }
      const transformedOperations = this.transformOperations(api, resource);
      const keys = Object.keys(transformedOperations);
      resources[id] = { ...resource, operations: keys };
      operations = { ...operations, ...transformedOperations };
    }
    for (const group of api.groups) {
      const id = uuidv4();
      const resourceIds: string[] = [];
      for (const resource of group.resources) {
        const id = uuidv4();
        if (resource.description) {
          resource.description = converter.makeHtml(resource.description);
        }
        const transformedOperations = this.transformOperations(api, resource);
        const keys = Object.keys(transformedOperations);
        resources[id] = { ...resource, operations: keys };
        operations = { ...operations, ...transformedOperations };
        resourceIds.push(id);
      }
      groups[id] = { ...group, resources: resourceIds };
    }

    const name = api.info.name;
    const description = api.info.description ? converter.makeHtml(api.info.description) : '';

    return { name, description, resources, operations, groups };
  }

  protected static transformOperations(api: ApiModel, resource: Resource): Operations {
    const operations: Operations = {};
    for (const operation of resource.operations) {
      const id = uuidv4();
      if (operation.description) {
        operation.description = converter.makeHtml(operation.description);
      }
      operation.snippet = this.createSnippet(api, resource, operation);
      operation.exampleResponse = this.getExampleResponse(operation);
      operation.exampleRequest = this.getExampleRequest(operation);
      operations[id] = operation;
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
