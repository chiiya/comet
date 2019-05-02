import {
  ApiModel, Authentication,
  CommandConfig,
  Information, JsonSchema,
  LoggerInterface, Operation, Parameter,
  ParserInterface, Resource, ResourceGroup,
} from '@comet-cli/types';
import * as get from 'lodash/get';
import { readFile, writeFile } from 'fs-extra';
import ParsingException from './ParsingException';
import { Mson } from '../types/mson';
const { promisify } = require('util');
const drafter = require('drafter');

export default class ApiBlueprintParser implements ParserInterface {
  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    try {
      const source = await readFile(path, 'utf8');
      logger.spin('Parsing API Blueprint specification...');
      const parse = promisify(drafter.parse);
      const result = await parse(source, { type: 'ast' });
      await writeFile('./result.json', JSON.stringify(result.ast, null, 2));
      return {
        info: this.parseInformation(result),
        auth: this.parseAuthentication(result),
        resources: this.parseDefaultGroupedResources(result),
        groups: this.parseGroups(result),
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

  protected parseInformation(result: any): Information {
    if (get(result, 'ast.name') === undefined) {
      throw new ParsingException('No API name specified');
    }
    const metadata = this.parseMetadata(result);
    const host = metadata['HOST'];
    const version = metadata['VERSION'] || null;
    if (host === undefined) {
      throw new ParsingException('No host url specified');
    }

    return {
      host,
      version,
      name: get(result, 'ast.name'),
      description: get(result, 'ast.description', null),
    };
  }

  protected parseAuthentication(result: any): Authentication {
    const metadata = this.parseMetadata(result);
    const type = metadata['AUTH_TYPE'] || null;
    const name = metadata['AUTH_NAME'] || null;
    const location = metadata['AUTH_LOCATION'] || null;

    return {
      type,
      name,
      location,
    };
  }

  protected parseGroups(result: any): ResourceGroup[] {
    const resourceGroups: ResourceGroup[] = [];
    const groups = result.ast.content.filter((item) => {
      return item.element === 'category' && item.hasOwnProperty('attributes') && item.attributes.name !== '';
    });
    for (const group of groups) {
      const description = group.content.find((item) => {
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

  protected parseDefaultGroupedResources(result: any): Resource[] {
    const defaultGroup = result.ast.content.find((item) => {
      return item.element === 'category' && item.hasOwnProperty('attributes') === false;
    });
    if (defaultGroup !== undefined) {
      return this.parseResources(defaultGroup.content);
    }
    return [];
  }

  protected parseResources(content: any): Resource[] {
    const resources: Resource[] = [];
    const astResources = content.filter((item) => {
      return item.element === 'resource';
    });
    for (const resource of astResources) {
      const actions = [];
      // API Blueprint lets actions define their own URIs.
      // If the action URI is different from the resource URI (excluding query parameters)
      // there should be a new resource for it.
      for (const action of resource.actions || []) {
        const uri = get(action, 'attributes.uriTemplate');
        if (uri === undefined) continue;
        const trimmedUri = uri.replace(/{[?&#+].+}/g, '');
        if (trimmedUri === resource.uriTemplate) {
          actions.push(action);
          continue;
        }
        const existingResource = resources.find(item => item.path === trimmedUri);
        if (existingResource !== undefined) {
          existingResource.operations.push(this.parseOperation(existingResource.path, action));
        } else {
          const operation = this.parseOperation(resource.path, action);
          resources.push({
            path: trimmedUri,
            name: null,
            description: null,
            parameters: this.parseParameters(resource.uriTemplate, resource.parameters),
            operations: [operation],
          });
        }
      }

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

  protected parseParameters(uri: string, params): Parameter[] {
    const parameters: Parameter[] = [];
    for (const param of params) {
      const regex = new RegExp(`{[?&#+].*${param.name}`);
      let location;
      let defaultRequired;
      if (regex.test(uri) === true) {
        location = 'query';
        defaultRequired = false;
      } else {
        location = 'path';
        defaultRequired = true;
      }
      parameters.push({
        location,
        name: param.name,
        description: param.description.trim(),
        required: param.required || defaultRequired,
        example: param.example || null,
        deprecated: false,
        schema: this.transformMsonToJsonSchema({ type: param.type, default: param.default, values: param.values }),
      });
    }
    return parameters;
  }

  protected parseOperation(resourceUri: string, action: any): Operation {
    const uri = get(action, 'attributes.uriTemplate', resourceUri);
    return {
      name: action.name,
      method: action.method,
      description: action.description || null,
      parameters: this.parseParameters(uri, action.parameters),
      request: null,
      responses: [],
      deprecated: false,
    };
  }

  protected parseMetadata(result: any) {
    const metadata = {};
    for (const item of result.ast.metadata) {
      metadata[item.name] = item.value;
    }
    return metadata;
  }

  protected transformMsonToJsonSchema(data: Mson): JsonSchema {
    if (this.isValidType(data.type) === false) {
      throw new ParsingException(`Invalid type definition: ${data.type}`);
    }

    const schema: JsonSchema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      default: data.default,
      type: data.type,
    };

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

    return schema;
  }

  protected isValidType(type: string): boolean {
    return ['null', 'boolean', 'object', 'array', 'number', 'integer', 'string'].includes(type);
  }
}
