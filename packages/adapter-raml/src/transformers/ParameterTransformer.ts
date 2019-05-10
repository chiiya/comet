import Specification from '../Specification';
import { TypeDeclaration } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Dict, Parameter, ParameterLocation } from '@comet-cli/types';
import SchemaTransformer from './SchemaTransformer';
import { CanonicalType } from '../../types/raml';
const tools = require('datatype-expansion');

export default class ParameterTransformer {
  public static execute(spec: Specification, params: TypeDeclaration[], location: ParameterLocation): Parameter[] {
    const parameters: Parameter[] = [];
    for (const param of params) {
      const description = param.description();
      parameters.push({
        name: param.name(),
        description: description ? description.value() : null,
        location: location,
        required: param.required(),
        example: this.getExampleValue(param),
        schema: SchemaTransformer.execute(spec, param),
        deprecated: false,
      });
    }
    return parameters;
  }

  public static transformFromQueryString(spec: Specification, query: TypeDeclaration): Parameter[] {
    const parameters: Parameter[] = [];
    const object = query.toJSON({ serializeMetadata: false });
    const expanded = tools.expandedForm(object, spec.types);
    const canonical: CanonicalType = tools.canonicalForm(expanded);
    if (canonical.type === 'object') {
      const properties = <CanonicalType>this.getProperties(canonical);
      for (const [name, parameter] of Object.entries(properties)) {
        const description = parameter.description();
        parameters.push({
          name: name,
          description: description ? description.value() : null,
          location: 'query',
          required: parameter.required(),
          example: this.getExampleValue(parameter),
          schema: SchemaTransformer.execute(spec, parameter),
          deprecated: false,
        });
      }
    }
    return parameters;
  }

  protected static getProperties(canonical: CanonicalType): Dict<CanonicalType> {
    let properties: Dict<CanonicalType> = {};
    if (canonical.anyOf) {
      for (const subSchema of canonical.anyOf) {
        properties = { ...properties, ...this.getProperties(subSchema) };
      }
    }
    if (canonical.properties) {
      properties = { ...properties, ...canonical.properties };
    }
    return properties;
  }

  public static getExampleValue(param: TypeDeclaration): any {
    if (param.example()) {
      return param.example().value();
    }
    if (param.examples() && param.examples().length > 0) {
      return param.examples()[0].value();
    }
  }
}
