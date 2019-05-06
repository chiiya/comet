import {
  AdapterInterface,
  ApiKeyLocation,
  ApiModel,
  Authentication,
  AuthType,
  CommandConfig,
  Dict,
  Header,
  Information,
  JsonSchema,
  LoggerInterface,
  Operation,
  Parameter,
  Request,
  Resource,
  ResourceGroup,
  Responses,
} from '@comet-cli/types';
import { isNumber } from '@comet-cli/utils';
import * as get from 'lodash/get';
import { readFile } from 'fs-extra';
import ParsingException from './ParsingException';
import {
  ApiBlueprintAction,
  ApiBlueprintAst,
  ApiBlueprintCopy,
  ApiBlueprintExample,
  ApiBlueprintHeader,
  ApiBlueprintParameter, ApiBlueprintRequest,
  ApiBlueprintResource, ApiBlueprintResponse,
  ApiBlueprintSpec,
} from '../types/blueprint';

const { promisify } = require('util');
const drafter = require('drafter');

export default class ApiBlueprintAdapter implements AdapterInterface {
  protected config: CommandConfig;
  protected logger: LoggerInterface;
  protected ast: ApiBlueprintAst;
  protected auth: Authentication;

  /**
   * Read an API Blueprint specification from `path`, and parse it into an api model.
   * @param path
   * @param config
   * @param logger
   */
  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    this.config = config;
    this.logger = logger;

    // Parse input file
    try {
      const source = await readFile(path, 'utf8');
      const parse = promisify(drafter.parse);
      const result: ApiBlueprintSpec = await parse(source, { type: 'ast' });
      this.ast = result.ast;
      const metadata = this.parseMetadata();
      this.auth = this.parseAuthentication(metadata);
      return {
        info: this.parseInformation(metadata),
        auth: { Default: this.auth },
        groups: this.parseGroups(),
        resources: this.parseDefaultGroupedResources(),
      };
    } catch (error) {
      // Provide a more helpful error message
      if (error.code === 'ENOENT') {
        error.message = `${path}: No such file or directory`;
      } else if (error.name !== 'ParsingException') {
        error.message = `${path} is not a valid API Blueprint schema. \n${error.message}`;
      }
      throw error;
    }
  }

  /**
   * Parse basic information from AST and metadata.
   * @param metadata
   */
  protected parseInformation(metadata: Dict<string>): Information {
    const name = get(this.ast, 'name');
    const host = metadata['HOST'];
    const version = metadata['VERSION'] || null;

    // Throw exception if required metadata is missing.
    if (name === undefined) {
      throw new ParsingException('No API name specified');
    }
    if (host === undefined) {
      throw new ParsingException('No host url specified');
    }

    const server = {
      uri: host,
    };

    return {
      version,
      name,
      description: get(this.ast, 'description', null),
      servers: [server],
    };
  }

  /**
   * Parse authentication metadata. Throw error if value is not supported.
   * @param metadata
   */
  protected parseAuthentication(metadata: Dict<string>): Authentication {
    const type = <AuthType>metadata['AUTH_TYPE'] || null;
    const description = metadata['AUTH_DESCRIPTION'] || null;
    const name = metadata['AUTH_NAME'] || null;
    const location = <ApiKeyLocation>metadata['AUTH_LOCATION'] || null;
    const flowType = metadata['AUTH_FLOW_TYPE'] || null;
    const refreshUri = metadata['AUTH_REFRESH_URI'] || null;
    const authorizationUri = metadata['AUTH_REFRESH_URI'] || null;
    const tokenUri = metadata['AUTH_TOKEN_URI'] || null;

    if (type && ['basic', 'digest', 'jwt', 'key', 'oauth2'].includes(type) === false) {
      throw new ParsingException(`Invalid AUTH_TYPE:  ${type}. Requires one of [basic, digest, jwt, key, oauth2]`);
    }

    if (location && ['header', 'cookie', 'query'].includes(location) === false) {
      throw new ParsingException(`Invalid AUTH_LOCATION:  ${location}. Requires one of [header, cookie, query]`);
    }

    if (flowType && ['implicit', 'password', 'clientCredentials', 'authorizationCode'].includes(flowType) === false) {
      throw new ParsingException(
        `Invalid AUTH_FLOW_TYPE:  ${flowType}. `
        + 'Requires one of [implicit, password, clientCredentials, authorizationCode]',
      );
    }

    const flows = {};
    flows[flowType] = {
      refreshUri,
      authorizationUri,
      tokenUri,
      scopes: [],
    };

    return {
      type,
      description,
      name,
      location,
      flows,
    };
  }

  /**
   * Parse named resource groups from the AST. Exclude default (unnamed) resource group,
   * and optionally the `Root` group.
   */
  protected parseGroups(): ResourceGroup[] {
    const resourceGroups: ResourceGroup[] = [];
    // Only resource groups will have the `attributes` property. Unnamed resource groups
    // will not have a name. To allow mixing grouped resources and non-grouped resources,
    // we will ungroup the `Root` resource group, if present.
    const astGroups = this.ast.content.filter((item) => {
      const isGroup = item.content.length > 0
        && item.content[0].element === 'resource'
        && item.hasOwnProperty('attributes')
        && item.attributes.name !== '';
      return this.config.ungroupRoot === true ? isGroup && item.attributes.name !== 'Root' : isGroup;
    });
    for (const group of astGroups) {
      const description = <ApiBlueprintCopy>group.content.find((item) => {
        return item.element === 'copy';
      });
      resourceGroups.push({
        name: group.attributes.name,
        description: description !== undefined ? description.content : null,
        resources: this.parseResources(group.content),
      });
    }
    return resourceGroups;
  }

  /**
   * Parse resources that are grouped within the default resource group.
   */
  protected parseDefaultGroupedResources(): Resource[] {
    let resources: Resource[] = [];

    const defaultGroup = this.ast.content.find((item) => {
      return item.content.length > 0
        && item.content[0].element === 'resource'
        && item.hasOwnProperty('attributes') === false;
    });
    const rootGroup = this.ast.content.find((item) => {
      return item.content.length > 0
        && item.content[0].element === 'resource'
        && item.hasOwnProperty('attributes')
        && item.attributes.name === 'Root';
    });

    if (defaultGroup !== undefined) {
      resources = [...resources, ...this.parseResources(defaultGroup.content)];
    }
    // To allow mixing grouped resources and non-grouped resources, we will ungroup the `Root`
    // resource group, if present.
    if (this.config.ungroupRoot === true && rootGroup !== undefined) {
      resources = [...resources, ...this.parseResources(rootGroup.content)];
    }

    return resources;
  }

  /**
   * Parse resources from the AST.
   * @param content
   */
  protected parseResources(content: (ApiBlueprintResource | ApiBlueprintCopy)[]): Resource[] {
    const resources: Resource[] = [];
    const astResources = <ApiBlueprintResource[]>content.filter((item) => {
      return item.element === 'resource';
    });
    for (const resource of astResources) {
      const actions = [];
      // API Blueprint lets actions define their own URIs.
      // If the action URI is different from the resource URI (excluding query parameters)
      // there should be a new resource for it.
      for (const action of resource.actions || []) {
        const uri = get(action, 'attributes.uriTemplate');
        if (uri === undefined || uri === '' || uri === null) {
          actions.push(action);
          continue;
        }
        const trimmedUri = uri.replace(/{[?&#+].+}/g, '');
        if (trimmedUri === resource.uriTemplate) {
          actions.push(action);
          continue;
        }
        const existingResource = resources.find(item => item.path === trimmedUri);
        if (existingResource !== undefined) {
          existingResource.operations.push(this.parseOperation(existingResource.path, action));
        } else {
          const operation = this.parseOperation(resource.uriTemplate, action);
          resources.push({
            path: trimmedUri,
            name: null,
            description: null,
            parameters: this.parseParameters(resource.uriTemplate, resource.parameters),
            operations: [operation],
          });
        }
      }

      // Now parse the operations that actually belong to this resource.
      if (actions.length > 0) {
        const operations: Operation[] = [];
        for (const action of actions) {
          operations.push(this.parseOperation(resource.uriTemplate, action));
        }
        resources.push({
          path: resource.uriTemplate,
          name: resource.name,
          description: resource.description,
          parameters: this.parseParameters(resource.uriTemplate, resource.parameters),
          // tslint:disable-next-line:object-shorthand-properties-first
          operations,
        });
      }
    }
    return resources;
  }

  /**
   * Parse parameters from the AST.
   * @param uri
   * @param params
   */
  protected parseParameters(uri: string, params: ApiBlueprintParameter[]): Parameter[] {
    const parameters: Parameter[] = [];
    for (const param of params) {
      const isQueryParam = new RegExp(`{[?&#+].*${param.name}`);
      let location;
      let defaultRequired;
      if (isQueryParam.test(uri) === true) {
        location = 'query';
        defaultRequired = false;
      } else {
        location = 'path';
        defaultRequired = true;
      }
      parameters.push({
        location,
        name: decodeURI(param.name),
        description: param.description.trim(),
        required: param.required || defaultRequired,
        example: param.example || null,
        deprecated: false,
        schema: this.transformParameterToJsonSchema(param),
      });
    }
    return parameters;
  }

  /**
   * Parse an API operation from an API Blueprint action definition.
   * @param resourceUri
   * @param action
   */
  protected parseOperation(resourceUri: string, action: ApiBlueprintAction): Operation {
    const uri = get(action, 'attributes.uriTemplate', resourceUri);
    const parsedRequest = this.parseRequest(action.examples);
    const parsedParameters = this.parseParameters(uri, action.parameters);
    return {
      name: action.name,
      method: action.method,
      description: action.description || null,
      parameters: parsedParameters,
      request: parsedRequest,
      responses: this.parseResponses(action.examples),
      deprecated: false,
      securedBy: this.getSecuredByFromRequestHeadersOrParameters(parsedRequest.headers, parsedParameters),
    };
  }

  protected getSecuredByFromRequestHeadersOrParameters(
    headers: Header[],
    parameters: Parameter[],
  ): Dict<string[]> {
    if (this.auth.type === null) {
      return undefined;
    }
    // Handle case where auth key / token is passed via query parameter
    if (this.auth.location === 'query') {
      return parameters.find(item => item.name === this.auth.name) !== undefined ? { Default: [] } : undefined;
    }
    // Handle case where auth key / token is passed via HTTP header
    let header;
    switch (this.auth.type) {
      case 'basic':
      case 'digest':
      case 'jwt':
      case 'oauth2':
        header = 'Authorization';
        break;
      case 'key':
        header = this.auth.name;
        break;
    }
    return headers.find(item => item.key === header) !== undefined ? { Default: [] } : undefined;
  }

  /**
   * Parse AST requests.
   * @param examples
   */
  protected parseRequest(examples: ApiBlueprintExample[]): Request {
    if (examples.length === 0) {
      return null;
    }

    // First, get an array of all example requests.
    const exampleRequests: ApiBlueprintRequest[] = [];
    for (const example of examples) {
      if (example.requests && example.requests.length > 0) {
        exampleRequests.push(...example.requests);
      }
    }
    // Then, iterate over the requests, group them by media-type and extract all the headers
    const request: Request = {
      headers: [],
      body: {},
    };
    const foundHeaders = {};
    for (const exampleRequest of exampleRequests) {
      const headers = this.parseHeaders(exampleRequest.headers);
      for (const header of headers) {
        if (header.key === 'Content-Type' || foundHeaders[header.key]) {
          continue;
        }
        foundHeaders[header.key] = true;
        request.headers.push(header);
      }
      const contentType = headers.find(header => header.key === 'Content-Type');
      const mediaType = contentType !== undefined ? contentType.example : null;
      if (mediaType !== null && request.body[mediaType]) {
        request.body[mediaType].examples.push(exampleRequest.body);
      } else {
        request.body[mediaType] = {
          mediaType,
          schema: exampleRequest.schema !== '' ? JSON.parse(exampleRequest.schema) : null,
          examples: exampleRequest.body ? [exampleRequest.body] : [],
        };
      }
    }

    return request;
  }

  /**
   * Parse AST responses.
   * @param examples
   */
  protected parseResponses(examples: ApiBlueprintExample[]): Responses {
    if (examples.length === 0) {
      return {};
    }

    // First, get an array of all example responses.
    const exampleResponses: ApiBlueprintResponse[] = [];
    for (const example of examples) {
      if (example.responses && example.responses.length > 0) {
        exampleResponses.push(...example.responses);
      }
    }
    // Then, iterate over the responses, group them by status code and media-type and extract all the headers
    const responses: Responses = {};
    const foundHeaders: { [code: string]: any } = {};
    for (const exampleResponse of exampleResponses) {
      const statusCode = exampleResponse.name;
      // Create response if it does not exist yet
      if (responses[statusCode] === undefined) {
        responses[statusCode] = {
          statusCode: Number(statusCode),
          headers: [],
          body: {},
          description: exampleResponse.description || null,
        };
      }
      const headers = this.parseHeaders(exampleResponse.headers);
      for (const header of headers) {
        if (header.key === 'Content-Type' || foundHeaders[statusCode][header.key]) {
          continue;
        }
        foundHeaders[statusCode][header.key] = true;
        responses[statusCode].headers.push(header);
      }

      const contentType = headers.find(header => header.key === 'Content-Type');
      const mediaType = contentType !== undefined ? contentType.example : null;
      if (mediaType !== null && responses[statusCode].body[mediaType]) {
        responses[statusCode].body[mediaType].examples.push(exampleResponse.body);
      } else {
        responses[statusCode].body[mediaType] = {
          mediaType,
          schema: exampleResponse.schema !== '' ? JSON.parse(exampleResponse.schema) : null,
          examples: exampleResponse.body ? [exampleResponse.body] : [],
        };
      }
    }

    return responses;
  }

  /**
   * Parse AST header definitions.
   * @param data
   */
  protected parseHeaders(data: ApiBlueprintHeader[]): Header[] {
    const headers: Header[] = [];
    for (const header of data) {
      headers.push({
        description: null,
        key: header.name,
        example: header.value,
        schema: this.inferSchemaFromPrimitive(header.value),
        deprecated: false,
      });
    }
    return headers;
  }

  /**
   * Infer a valid JSON schema from a primitive (string/number).
   * @param value
   */
  protected inferSchemaFromPrimitive(value: any): JsonSchema {
    return {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: isNumber(value) ? 'number' : 'string',
    };
  }

  /**
   * Parse metadata from an API Blueprint AST into a dictionary.
   */
  protected parseMetadata(): Dict<string> {
    const metadata = {};
    for (const item of this.ast.metadata) {
      metadata[item.name] = item.value;
    }
    return metadata;
  }

  /**
   * Transform an MSON parameter type definition to a valid JSON schema definition.
   * @param data
   */
  protected transformParameterToJsonSchema(data: ApiBlueprintParameter): JsonSchema {
    const isNestedArrayType = this.isNestedArrayType(data.type);

    if (this.isValidType(data.type) === false && isNestedArrayType === false) {
      throw new ParsingException(`Invalid type definition: ${data.type}`);
    }

    const schema: JsonSchema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: data.type,
    };

    if (data.default) {
      schema.default = data.default;
    }

    // If it's an enum (values array present), adjust the schema
    if (data.values && data.values.length > 0) {
      const values = data.values ? data.values.map(item => item.value) : [];
      schema.type = 'array';
      schema.items = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        type: data.type,
        enum: values,
      };
    }

    // If it's a nested array type definition (e.g. array[string]), adjust the schema
    if (isNestedArrayType) {
      const nestedType = /array\[(\w+)]/g.exec(data.type)[1];
      schema.type = 'array';
      if (this.isValidType(nestedType)) {
        schema.items = {
          $schema: 'http://json-schema.org/draft-04/schema#',
          type: nestedType,
        };
      }
    }

    return schema;
  }

  /**
   * Check whether an MSON type definition is a valid type.
   * @param type
   */
  protected isValidType(type: string): boolean {
    return ['null', 'boolean', 'object', 'array', 'number', 'integer', 'string'].includes(type);
  }

  /**
   * Check whether an MSON type definition is a nested array, e.g. `array[string]`
   * @param type
   */
  protected isNestedArrayType(type: string): boolean {
    return /array\[\w+]/g.test(type);
  }
}
