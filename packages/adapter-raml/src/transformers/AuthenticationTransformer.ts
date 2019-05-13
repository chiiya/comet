import Specification from '../Specification';
import { Authentication, AuthType, Dict } from '@comet-cli/types';
import {
  AbstractSecurityScheme,
  OAuth2SecuritySchemeSettings,
} from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import ParsingException from '../ParsingException';

export default class AuthenticationTransformer {
  public static execute(spec: Specification): Dict<Authentication> {
    const schemes = spec.api.securitySchemes() || [];
    const auth: Dict<Authentication> = {};
    for (const scheme of schemes) {
      let type: AuthType | undefined = undefined;
      switch (scheme.type()) {
        case 'OAuth 2.0':
          type = 'oauth2';
          break;
        case 'Basic Authentication':
          type = 'basic';
          break;
        case 'Digest Authentication':
          type = 'basic';
          break;
        case 'Pass Through':
          type = 'key';
      }

      let flows = {};

      if (type === 'oauth2' && scheme.settings()) {
        flows = this.getOAuth2Settings(scheme);
      }

      // RAML allows defining multiple header or query parameter restrictions at once. In our
      // data model, that would be a security requirement rather than a strategy, which is why we
      // will transform this into multiple strategies, then create a mapping on the specification,
      // so that for securedBy declarations we know which strategies are meant

      const mappings = [];
      if (scheme.describedBy()) {
        let count = Object.keys(spec.authenticationMappings).length;
        const describedBy = scheme.describedBy();
        // Transform headers
        const headers = describedBy.headers();
        if (headers && headers.length > 0) {
          for (const header of headers) {
            auth[`comet_auth_${count}`] = {
              type: 'key',
              flows: {},
              name: header.name(),
              location: 'header',
              description: undefined,
            };
            mappings.push(`comet_auth_${count}`);
            count += 1;
          }
        }
        const params = describedBy.queryParameters();
        if (params && params.length > 0) {
          for (const param of params) {
            auth[`comet_auth_${count}`] = {
              type: 'key',
              flows: {},
              name: param.name(),
              location: 'query',
              description: undefined,
            };
            mappings.push(`comet_auth_${count}`);
            count += 1;
          }
        }
      }

      // For type API Key the scheme would be empty, since all the information is now in the
      // separate schemes we created above
      if (type !== 'key') {
        auth[scheme.name()] = {
          type,
          flows,
          description: scheme.description() ? scheme.description().value() : undefined,
        };
        spec.authenticationMappings[scheme.name()] = [...mappings, scheme.name()];
      } else {
        spec.authenticationMappings[scheme.name()] = mappings;
      }
    }

    return auth;
  }

  protected static getOAuth2Settings(scheme: AbstractSecurityScheme): any {
    const flows: ({ [key: string]: any }) = {};

    const settings = <OAuth2SecuritySchemeSettings>scheme.settings();
    const grants = settings.authorizationGrants() || [];
    const grant = grants[0];
    let flowType: string;
    switch (grant) {
      case 'authorization_code':
        flowType = 'authorizationCode';
        break;
      case 'client_credentials':
        flowType = 'clientCredentials';
        break;
      case 'password':
      case 'implicit':
        flowType = grant;
        break;
      default:
        throw new ParsingException(`Unsupported OAuth2 grant-type: ${grant}`);
    }

    flows[flowType] = {
      refreshUri: null,
      authorizationUri: settings.authorizationUri() ? settings.authorizationUri().value() : null,
      tokenUri: settings.accessTokenUri() ? settings.accessTokenUri().value() : null,
      scopes: settings.scopes(),
    };

    return flows;
  }
}
