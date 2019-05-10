import Specification from '../Specification';
import { Method } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Authentication, Dict, Operation } from '@comet-cli/types';
import SecuredByTransformer from './SecuredByTransformer';
import ParameterTransformer from './ParameterTransformer';

export default class OperationTransformer {
  public static execute(spec: Specification, methods: Method[], auth: Dict<Authentication>): Operation[] {
    const operations: Operation[] = [];
    for (const method of methods || []) {
      const description = method.description();
      const parameters = method.queryParameters();
      operations.push({
        method: method.method(),
        name: method.displayName(),
        description: description ? description.value() : null,
        securedBy: SecuredByTransformer.execute(spec, method.securedBy(), auth),
        parameters: ParameterTransformer.execute(spec, parameters, 'query'),
        transactions: [],
        tags: [],
        deprecated: false,
      });
    }

    return operations;
  }
}
