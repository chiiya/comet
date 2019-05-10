import Specification from '../Specification';
import { TypeDeclaration } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Header } from '@comet-cli/types';
import SchemaTransformer from './SchemaTransformer';
import ParameterTransformer from './ParameterTransformer';

export default class HeaderTransformer {
  public static execute(spec: Specification, specHeaders: TypeDeclaration[]): Header[] {
    const headers: Header[] = [];
    for (const header of specHeaders) {
      const description = header.description();
      headers.push({
        name: header.name(),
        description: description ? description.value() : null,
        required: header.required(),
        example: ParameterTransformer.getExampleValue(header),
        schema: SchemaTransformer.execute(spec, header),
        deprecated: false,
      });
    }

    return headers;
  }
}
