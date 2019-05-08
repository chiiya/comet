import Specification from '../Specification';
import { OpenAPIParameter, Referenced } from '../../types/open-api';
import { Parameter } from '@comet-cli/types';
import SchemaTransformer from './SchemaTransformer';
import ParameterValueResolver from '../resolvers/ParameterValueResolver';

export default class ParameterTransformer {
  public static execute(spec: Specification, paramRefs: Referenced<OpenAPIParameter>[]): Parameter[] {
    const parameters: Parameter[] = [];
    const params: OpenAPIParameter[] = paramRefs.map((param) => {
      const parameter = spec.deref(param);
      spec.exitRef(param);
      return parameter;
    });
    for (const param of params) {
      if (param.in !== 'header') {
        parameters.push({
          name: param.name,
          description: param.description || null,
          deprecated: param.deprecated || false,
          location: param.in,
          required: param.required,
          schema: SchemaTransformer.execute(spec, param.schema),
          example: ParameterValueResolver.inferValue(spec, param),
        });
      }
    }

    return parameters;
  }
}
