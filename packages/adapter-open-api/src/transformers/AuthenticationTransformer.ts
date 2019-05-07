import { Authentication, AuthType, Dict } from '@comet-cli/types';
import Specification from '../Specification';

export default class AuthenticationTransformer {
  public static execute(spec: Specification): Dict<Authentication> {
    const schemes = (spec.entity.components && spec.entity.components.securitySchemes) || {};
    const auth: Dict<Authentication> = {};
    for (const name of Object.keys(schemes)) {
      const scheme = spec.deref(schemes[name]);
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
}
