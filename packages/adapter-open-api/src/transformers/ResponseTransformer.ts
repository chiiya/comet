import Specification from '../Specification';
import { OpenAPIResponses } from '../../types/open-api';
import { Responses } from '@comet-cli/types';
import HeaderTransformer from './HeaderTransformer';
import BodyResolver from '../resolvers/BodyResolver';

export default class ResponseTransformer {
  public static execute(spec: Specification, specResponses: OpenAPIResponses): Responses {
    const responses: Responses = {};

    for (const code of Object.keys(specResponses)) {
      const response = specResponses[code];
      const headers = response.headers || null;
      responses[code] = {
        statusCode: code === 'default' ? code : Number(code),
        description: response.description || null,
        headers: headers ? HeaderTransformer.transformFromHeaders(spec, headers) : null,
        body: BodyResolver.execute(spec, response.content, 'response'),
      };
    }

    return responses;
  }
}
