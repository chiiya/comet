import {
  EnhancedOperation,
  getHumanReadableType,
  getJsonBody,
  getOperationName,
  getResolvedServerUrl,
  resolveExampleUri,
} from '@comet-cli/helper-utils';
import { DocHeader, DocOperation, DocResponses, Example } from '../types/api';
import { ApiModel, Bodies } from '@comet-cli/types';
const httpSnippet = require('httpsnippet');
const uuidv4 = require('uuid/v4');
const showdown = require('showdown');

const converter = new showdown.Converter({ tables: true });

export default class OperationTransformer {
  public static execute(model: ApiModel, operation: EnhancedOperation): DocOperation {
    const snippet = this.createSnippet(model, operation);
    const link = getOperationName(operation.uri, operation.method);
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
    const id = uuidv4();
    let description = operation.description;
    if (operation.description) {
      description = converter.makeHtml(operation.description);
    }
    const exampleResponse = this.getExampleResponse(operation);
    const exampleRequest = this.getExampleRequest(operation);
    const parameters = [...operation.parameters];
    for (const parameter of parameters) {
      parameter.displayType = getHumanReadableType(parameter.schema);
    }

    return {
      ...operation,
      transactions: undefined,
      description: description,
      parameters: parameters,
      id: id,
      snippet: snippet,
      link: link,
      requestHeaders: requestHeaders,
      responses: responses,
      exampleRequest: exampleRequest,
      exampleResponse: exampleResponse,
    };
  }

  protected static createSnippet(api: ApiModel, operation: EnhancedOperation): string {
    const snippet = new httpSnippet(this.createHar(api, operation));
    // generate Shell: cURL output
    return snippet.convert('shell', 'curl', {
      indent: '\t',
      short: true,
    });
  }

  protected static createHar(api: ApiModel, operation: EnhancedOperation): any {
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
    const url = new URL(resolveExampleUri(operation.uri, operation.parameters), server);
    return {
      headers,
      postData: postData && postData.text ? postData : undefined,
      method: operation.method.toUpperCase(),
      url: url.href,
    };
  }

  protected static getExampleResponse(operation: EnhancedOperation): Example | undefined {
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

  protected static getExampleRequest(operation: EnhancedOperation): Example | undefined {
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
