import Specification from '../Specification';
import { Method } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Authentication, Dict, Operation } from '@comet-cli/types';
import SecuredByTransformer from './SecuredByTransformer';
import ParameterTransformer from './ParameterTransformer';
import HeaderTransformer from './HeaderTransformer';
import RequestTransformer from './RequestTransformer';
import ResponseTransformer from './ResponseTransformer';

export default class OperationTransformer {
  public static execute(spec: Specification, methods: Method[], auth: Dict<Authentication>): Operation[] {
    const operations: Operation[] = [];
    for (const method of methods || []) {
      const description = method.description();
      const params = method.queryParameters() || [];
      const queryString = method.queryString();
      const parameters = [];
      if (params.length > 0) {
        parameters.push(...ParameterTransformer.execute(spec, params, 'query'));
      } else if (queryString) {
        parameters.push(...ParameterTransformer.transformFromQueryString(spec, queryString));
      }
      const requestHeaders = HeaderTransformer.execute(spec, method.headers() || []);
      const body = method.body() || [];
      const responses = method.responses() || [];
      operations.push({
        method: method.method(),
        name: method.displayName(),
        description: description ? description.value() : null,
        securedBy: SecuredByTransformer.execute(spec, method.securedBy(), auth),
        parameters: parameters,
        request: RequestTransformer.execute(spec, body, requestHeaders),
        responses: ResponseTransformer.execute(spec, responses),
        transactions: [],
        tags: [],
        deprecated: false,
      });
    }

    return operations;
  }
}
