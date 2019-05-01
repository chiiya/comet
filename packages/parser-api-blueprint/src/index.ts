import {
  ApiModel, Authentication,
  CommandConfig,
  Information,
  LoggerInterface,
  ParserInterface, Resource, ResourceGroup,
} from '@comet-cli/types';
import * as get from 'lodash/get';
import { readFile, writeFile } from 'fs-extra';
import ParsingException from './ParsingException';
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
      resources.push({
        path: resource.uriTemplate,
        name: resource.name,
        description: resource.description,
        parameters: [],
        operations: [],
      });
    }
    return resources;
  }

  protected parseMetadata(result: any) {
    const metadata = {};
    for (const item of result.ast.metadata) {
      metadata[item.name] = item.value;
    }
    return metadata;
  }
}
