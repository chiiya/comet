import { Authentication, AuthType, Dict } from '@comet-cli/types';
import Specification from '../Specification';
import { OpenAPISecurityScheme } from '../../types/open-api';

export default class AuthenticationTransformer {
  public static execute(spec: Specification): Dict<Authentication> {
    const schemes = (spec.entity.components && spec.entity.components.securitySchemes) || {};
    const auth: Dict<Authentication> = {};
    for (const name of Object.keys(schemes)) {
      const scheme = <OpenAPISecurityScheme>spec.deref(schemes[name]);
      let type: AuthType = 'key';
      switch (scheme.type) {
        case 'http':
          if (scheme.scheme === 'basic' || scheme.scheme === 'digest') {
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
      const flows: ({ [key: string]: any }) = {};
      if (scheme.flows) {
        for (const flowType of Object.keys(scheme.flows)) {
          // @ts-ignore
          const flow = scheme.flows[flowType];
          flows[flowType] = {
            refreshUri: flow.refreshUrl,
            authorizationUri: flow.authorizationUrl,
            tokenUri: flow.tokenUrl,
            scopes: flow.scopes,
          };
        }
      }
      let description = scheme.description || '';
      if (scheme.bearerFormat) {
        description = `\n Bearer-Format: ${scheme.bearerFormat}`;
      }
      auth[name] = {
        type,
        flows,
        description: description || undefined,
        name: scheme.name,
        location: scheme.in,
      };
    }

    return auth;
  }
}
