import { SecuritySchemeRef } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Authentication, Dict, SecurityRequirement } from '@comet-cli/types';
import Specification from '../Specification';

export default class SecuredByTransformer {
  public static execute(spec: Specification, auth: Dict<Authentication>): SecurityRequirement[] {
    const securedBy = spec.api.securedBy() || [];
    const requirements: SecurityRequirement[] = [];
    for (const ref of securedBy) {
      const requirement = {};
      const scheme = ref.toJSON();
      if (typeof scheme === 'string') {
        const mappings = spec.authenticationMappings[ref.securityScheme().name()];
        for (const mapping of mappings) {
          requirement[mapping] = [];
        }
        requirements.push(requirement);
      } else if (typeof scheme === 'object') {
        // Will always just have one property
        const key = Object.keys(scheme)[0];
        const mappings = spec.authenticationMappings[key];
        for (const mapping of mappings) {
          if (auth[mapping].type === 'oauth2') {
            requirement[mapping] = scheme[key].scopes;
          } else {
            requirement[mapping] = [];
          }
        }
        requirements.push(requirement);
      }
    }

    return requirements;
  }
}
