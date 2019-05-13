import Specification from '../Specification';
import { ApiKeyLocation, Authentication, AuthType } from '@comet-cli/types';
import ParsingException from '../ParsingException';

export default class AuthenticationTransformer {
  /**
   * Parse authentication metadata. Throw error if value is not supported.
   * @param spec
   */
  public static execute(spec: Specification): Authentication {
    const type = <AuthType>spec.metadata['AUTH_TYPE'] || null;
    const description = spec.metadata['AUTH_DESCRIPTION'] || undefined;
    const name = spec.metadata['AUTH_NAME'] || undefined;
    const location = <ApiKeyLocation>spec.metadata['AUTH_LOCATION'] || null;
    const flowType = spec.metadata['AUTH_FLOW_TYPE'] || null;
    const refreshUri = spec.metadata['AUTH_REFRESH_URI'] || null;
    const authorizationUri = spec.metadata['AUTH_AUTHORIZATION_URI'] || null;
    const tokenUri = spec.metadata['AUTH_TOKEN_URI'] || null;

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

    let flows = undefined;

    if (flowType) {
      flows = {};
      flows[flowType] = {
        refreshUri,
        authorizationUri,
        tokenUri,
        scopes: [],
      };
    }

    return {
      type,
      description,
      name,
      location,
      flows,
    };
  }
}
