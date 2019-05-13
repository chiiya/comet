import { Dict, Information, Schema, Server } from '@comet-cli/types';
import Specification from '../Specification';

export default class InformationTransformer {
  /**
   * Parse the general API information from an OpenAPI spec model.
   */
  public static execute(spec: Specification): Information {
    const name = spec.entity.info.title;
    let description = spec.entity.info.description;
    const version = spec.entity.info.version;
    const license = spec.entity.info.license;
    const terms = spec.entity.info.termsOfService;
    const contact = spec.entity.info.contact;

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

    if (spec.entity.externalDocs) {
      if (links !== '') {
        links += '\n';
      }
      links += `[${spec.entity.externalDocs.description}](${spec.entity.externalDocs.url})`;
    }

    if (links !== '') {
      description = `${links}\n\n${description}`;
    }

    return {
      name,
      description,
      version,
      servers: spec.entity.servers ? this.getServers(spec) : [],
    };
  }

  /**
   * Parse the server urls and variables.
   */
  protected static getServers(spec: Specification): Server[] {
    const servers: Server[] = [];
    for (const server of spec.entity.servers || []) {
      const variables: Dict<Schema> = {};
      if (server.variables) {
        for (const name of Object.keys(server.variables)) {
          variables[name] = {
            default: server.variables[name].default,
            description: server.variables[name].description,
            enum: server.variables[name].enum,
          };
        }
      }
      servers.push({
        uri: server.url,
        description: server.description || undefined,
        variables: server.variables ? variables : undefined,
      });
    }

    return servers;
  }
}
