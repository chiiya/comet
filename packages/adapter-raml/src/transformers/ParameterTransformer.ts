import Specification from '../Specification';
import { TypeDeclaration } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Parameter } from '@comet-cli/types';
import SchemaTransformer from './SchemaTransformer';

export default class ParameterTransformer {
  public static execute(spec: Specification, params: TypeDeclaration[]): Parameter[] {
    const parameters: Parameter[] = [];
    for (const param of params) {
      const description = param.description();
      parameters.push({
        name: param.name(),
        description: description ? description.value() : undefined,
        location: 'path',
        required: param.required(),
        example: this.getExampleValue(param),
        schema: SchemaTransformer.execute(spec, param),
        deprecated: false,
      });
    }
    return parameters;
  }

  protected static getExampleValue(param: TypeDeclaration): any {
    if (param.example()) {
      return param.example().value();
    }
    if (param.examples() && param.examples().length > 0) {
      return param.examples()[0].value();
    }
  }
}
