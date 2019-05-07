import {
  AdapterInterface,
  ApiModel, Authentication, AuthType,
  CommandConfig, Dict, Header,
  Information, JsonSchema,
  LoggerInterface, Operation, Parameter, Request, Resource, Responses, Server,
} from '@comet-cli/types';
import {
  OpenApiSpec,
  OpenAPIParameter,
  OpenAPIOperation,
  OpenAPIRequestBody, OpenAPIResponses, OpenApiHeaders,
} from '../types/open-api';
import Transformer from './Transformer';
import ParameterResolver from './ParameterResolver';
import { Method } from '../types/helpers';
import BodyResolver from './BodyResolver';
import Parser from './Parser';

export default class OpenApiAdapter implements AdapterInterface {
  protected config: CommandConfig;
  protected logger: LoggerInterface;
  protected spec: OpenApiSpec;

  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    this.config = config;
    this.logger = logger;

    // Parse input file
    try {
      this.spec = await Parser.load(path);
      return {
        info: this.parseInformation(),
        auth: this.parseAuth(),
        groups: [],
        resources: this.parseResources(),
        securedBy: this.spec.security || null,
      };
    } catch (error) {
      // Provide a more helpful error message
      if (error.code === 'ENOENT') {
        error.message = `${path}: No such file or directory`;
      } else if (error.name !== 'ParsingException') {
        error.message = `${path} is not a valid OpenAPI schema. \n${error.message}`;
      }
      throw error;
    }
  }

  /**
   * Parse the general API information from an OpenAPI spec model.
   */
  protected parseInformation(): Information {
    const name = this.spec.info.title;
    let description = this.spec.info.description;
    const version = this.spec.info.version;
    const license = this.spec.info.license;
    const terms = this.spec.info.termsOfService;
    const contact = this.spec.info.contact;

    // Prepend relevant contact / license and terms of service links to description,
    // in Markdown format.
    let links = '';
    if (contact !== undefined) {
      let contactLinks = '';
      if (contact.name) {
        contactLinks += `${contact.name}: `;
      }
      if (contact.email) {
        contactLinks += `[${contact.email}](mailto:${contact.email}) - `;
      }
      if (contact.url) {
        contactLinks += `[${contact.url}](${contact.url})`;
      }
      links += contactLinks;
    }
    if (license !== undefined) {
      links += ` | License: [${license.name}](${license.url})`;
    }
    if (terms !== undefined) {
      links += ` | [Terms of Service](${terms})`;
    }

    if (this.spec.externalDocs) {
      if (links !== '') {
        links += '\n';
      }
      links += `[${this.spec.externalDocs.description}](${this.spec.externalDocs.url})`;
    }

    if (links !== '') {
      description = `${links}\n\n${description}`;
    }

    return {
      name,
      description,
      version,
      servers: this.spec.servers ? this.getServers() : [],
    };
  }

  protected parseAuth(): Dict<Authentication> {
    if (this.spec.components.securitySchemes === undefined) {
      return undefined;
    }
    const auth: Dict<Authentication> = {};
    for (const name of Object.keys(this.spec.components.securitySchemes)) {
      const scheme = this.spec.components.securitySchemes[name];
      let type: AuthType;
      switch (scheme.type) {
        case 'http':
          if (['basic', 'digest'].includes(scheme.scheme)) {
            type = <AuthType>scheme.scheme;
          }
          if (scheme.bearerFormat === 'JWT') {
            type = 'jwt';
          }
          break;
        case 'apiKey':
          type = 'key';
          break;
        case 'oauth2':
          type = 'oauth2';
      }
      const flows = {};
      if (scheme.flows) {
        for (const flowType of Object.keys(scheme.flows)) {
          const flow = scheme.flows[flowType];
          flows[flowType] = {
            refreshUri: flow.refreshUrl,
            authorizationUri: flow.authorizationUrl,
            tokenUri: flow.tokenUrl,
            scopes: flow.scopes,
          };
        }
      }
      auth[name] = {
        type,
        flows,
        description: scheme.description,
        name: scheme.name,
        location: scheme.in,
      };
    }

    return auth;
  }

  protected parseResources(): Resource[] {
    const resources: Resource[] = [];
    for (const path of Object.keys(this.spec.paths)) {
      const openApiResource = this.spec.paths[path];
      const params = openApiResource.parameters || [];
      const resourceHeaders = this.parseHeadersFromParameters(params);
      const methods = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      const operations: Operation[] = [];
      for (const key of Object.keys(openApiResource)) {
        if (methods.includes(key) === false) {
          continue;
        }
        const operation = openApiResource[key];
        if (operation) {
          operations.push(this.parseOperation(operation, <Method>key, resourceHeaders));
        }
      }
      resources.push({
        path,
        operations,
        name: openApiResource.summary,
        description: openApiResource.description,
        parameters: this.parseParameters(params),
      });
    }

    return resources;
  }

  protected parseParameters(params: OpenAPIParameter[]): Parameter[] {
    const parameters: Parameter[] = [];
    for (const param of params) {
      if (param.in !== 'header') {
        parameters.push({
          name: param.name,
          description: param.description || null,
          deprecated: param.deprecated || false,
          location: param.in,
          required: param.required,
          schema: Transformer.execute(param.schema),
          example: ParameterResolver.inferValue(param),
        });
      }
    }

    return parameters;
  }

  protected parseHeadersFromParameters(params: OpenAPIParameter[]): Header[] {
    const headers: Header[] = [];
    const headerParams = params.filter(param => param.in === 'header');
    for (const param of headerParams) {
      const schema = param.schema;
      headers.push({
        key: param.name,
        description: param.description || null,
        deprecated: param.deprecated || false,
        example: ParameterResolver.inferValue(param),
        schema: schema ? Transformer.execute(param.schema) : null,
        required: param.required || false,
      });
    }

    return headers;
  }

  protected parseHeadersFromOpenApiHeaders(openApiHeaders: OpenApiHeaders): Header[] {
    const headers: Header[] = [];
    for (const name of Object.keys(openApiHeaders)) {
      const header = openApiHeaders[name];
      const schema = header.schema;
      headers.push({
        key: name,
        description: header.description || null,
        deprecated: header.deprecated || false,
        example: ParameterResolver.inferValue(header),
        schema: schema ? Transformer.execute(header.schema) : null,
        required: header.required || false,
      });
    }

    return headers;
  }

  protected parseOperation(operation: OpenAPIOperation, method: Method, resourceHeaders: Header[]): Operation {
    const params = operation.parameters || [];
    // Overwrite resource headers with operation headers.
    const operationHeaders = this.parseHeadersFromParameters(params);
    const headers = this.mergeHeaders(resourceHeaders, operationHeaders);

    let description = operation.description || operation.summary || '';
    if (operation.externalDocs) {
      description = `[${operation.externalDocs.description}](${operation.externalDocs.url})\n\n${description}`;
    }
    const transaction = {
      request: this.parseRequest(operation.requestBody, headers),
      responses: this.parseResponses(operation.responses),
    };
    return {
      method,
      name: operation.operationId || null,
      description: description || null,
      deprecated: operation.deprecated || false,
      tags: operation.tags,
      parameters: this.parseParameters(params),
      securedBy: operation.security,
      transactions: [transaction],
    };
  }

  protected parseRequest(requestBody: OpenAPIRequestBody, headers: Header[]): Request {
    const request: Request = {
      headers,
      description: null,
      body: null,
    };
    if (requestBody) {
      request.description = requestBody.description || null;
      request.body = BodyResolver.execute(requestBody.content, 'request');
    }

    return request;
  }

  protected parseResponses(specResponses: OpenAPIResponses): Responses {
    const responses: Responses = {};

    for (const code of Object.keys(specResponses)) {
      const response = specResponses[code];
      const headers = response.headers || null;
      responses[code] = {
        statusCode: code === 'default' ? code : Number(code),
        description: response.description || null,
        headers: headers ? this.parseHeadersFromOpenApiHeaders(headers) : null,
        body: BodyResolver.execute(response.content, 'response'),
      };
    }

    return responses;
  }

  protected mergeHeaders(resourceHeaders: Header[], operationHeaders: Header[]): Header[] {
    const mergedHeaders = {};
    for (const header of resourceHeaders) {
      mergedHeaders[header.key] = header;
    }
    for (const header of operationHeaders) {
      mergedHeaders[header.key] = header;
    }
    const headers = [];
    for (const header of Object.keys(mergedHeaders)) {
      headers.push(mergedHeaders[header]);
    }

    return headers;
  }

  /**
   * Parse the server urls and variables.
   */
  protected getServers(): Server[] {
    const servers: Server[] = [];
    for (const server of this.spec.servers) {
      const variables: Dict<JsonSchema> = {};
      if (server.variables) {
        for (const name of Object.keys(server.variables)) {
          variables[name] = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            default: server.variables[name].default,
            description: server.variables[name].description,
            enum: server.variables[name].enum,
          };
        }
      }
      servers.push({
        uri: server.url,
        description: server.description || null,
        variables: server.variables ? variables : null,
      });
    }

    return servers;
  }
}
