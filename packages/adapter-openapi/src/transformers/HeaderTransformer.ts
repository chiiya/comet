import { OpenApiHeaders, OpenAPIParameter, Referenced } from '../../types/open-api';
import { Header } from '@comet-cli/types';
import Specification from '../Specification';
import ParameterValueResolver from '../resolvers/ParameterValueResolver';
import SchemaTransformer from './SchemaTransformer';

export default class HeaderTransformer {
  public static transformFromParameters(spec: Specification, params: Referenced<OpenAPIParameter>[]): Header[] {
    const headers: Header[] = [];
    const parameters: OpenAPIParameter[] = params.map((param) => {
      const parameter = spec.deref(param);
      spec.exitRef(param);
      return parameter;
    });
    const headerParams: OpenAPIParameter[] = parameters.filter(param => param.in === 'header');
    for (const param of headerParams) {
      const schema = param.schema;
      headers.push({
        name: param.name,
        description: param.description || undefined,
        deprecated: param.deprecated || false,
        example: ParameterValueResolver.inferValue(spec, param),
        schema: schema ? SchemaTransformer.execute(spec, schema) : undefined,
        required: param.required || false,
      });
    }

    return headers;
  }

  public static transformFromHeaders(spec: Specification, specHeaders: OpenApiHeaders): Header[] {
    const headers: Header[] = [];
    for (const name of Object.keys(specHeaders)) {
      const header = spec.deref(specHeaders[name]);
      const schema = header.schema;
      headers.push({
        name: name,
        description: header.description || undefined,
        deprecated: header.deprecated || false,
        example: ParameterValueResolver.inferValue(spec, header),
        schema: schema ? SchemaTransformer.execute(spec, schema) : undefined,
        required: header.required || false,
      });
      spec.deref(specHeaders[name]);
    }

    return headers;
  }
}
