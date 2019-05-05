import {
  AdapterInterface,
  ApiModel, Authentication, AuthType,
  CommandConfig, Dict,
  Information,
  LoggerInterface,
} from '@comet-cli/types';
import { OpenApiSpec, OpenAPIServer } from '../types/open-api';
import * as get from 'lodash/get';
const parser = require('swagger-parser');

export default class OpenApiAdapter implements AdapterInterface {
  protected config: CommandConfig;
  protected logger: LoggerInterface;
  protected spec: OpenApiSpec;

  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    this.config = config;
    this.logger = logger;

    // Parse input file
    try {
      this.spec = await parser.dereference(path, { circular: 'ignore' });
      return {
        info: this.parseInformation(),
        auth: this.parseAuth(),
        groups: [],
        resources: [],
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
      description = `${links}\n${description}`;
    }

    const host = this.getHostUrl(this.spec.servers);

    return {
      name,
      description,
      version,
      host,
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
            authorizationUri: flow.authorizationUri,
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
  }

  /**
   * Parse the host URL.
   * @param servers
   */
  protected getHostUrl(servers: OpenAPIServer[]): string {
    const server = servers[0];
    return server.url;
    // Replace variables with their default value
    // let url = server.url;
    // const regex = new RegExp('\{(\w+\)}', 'g');
    // let result;
    // while ((result = regex.exec(server.url)) !== null) {
    //   const variable = result[1];
    //   url = url.replace(`{${variable}}`, server.variables[variable].default);
    // }

    // return url;
  }
}
