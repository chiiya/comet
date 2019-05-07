import Specification from '../Specification';
import { OpenAPIRequestBody, Referenced } from '../../types/open-api';
import { Header, Request } from '@comet-cli/types';
import BodyResolver from '../resolvers/BodyResolver';

export default class RequestTransformer {
  public static execute(
    spec: Specification,
    requestBody: Referenced<OpenAPIRequestBody>,
    headers: Header[],
  ): Request {
    const request: Request = {
      headers,
      description: null,
      body: null,
    };
    const body = spec.deref(requestBody);
    if (body) {
      request.description = body.description || null;
      request.body = BodyResolver.execute(spec, body.content, 'request');
    }
    spec.exitRef(requestBody);

    return request;
  }
}
