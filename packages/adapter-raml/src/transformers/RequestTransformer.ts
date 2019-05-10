import Specification from '../Specification';
import { Header, Request } from '@comet-cli/types';
import { TypeDeclaration } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import SchemaTransformer from './SchemaTransformer';

export default class RequestTransformer {
  public static execute(spec: Specification, bodies: TypeDeclaration[], headers: Header[]): Request {
    const request: Request = {
      headers,
      description: null,
      body: null,
    };

    for (const body of bodies) {
      const mediaType = body.name();
      const examples = [];
      if (body.example()) {
        examples.push(body.example());
      }
      if (body.examples() && body.examples().length > 0) {
        for (const example of body.examples()) {
          examples.push(example.value());
        }
      }
      request.body[mediaType] = {
        mediaType: mediaType,
        schema: SchemaTransformer.execute(spec, body),
        examples: examples,
      };
    }

    return request;
  }
}
