import Specification from '../Specification';
import { Header, Request } from '@comet-cli/types';
import { Method } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import SchemaTransformer from './SchemaTransformer';
import { CanonicalType } from '../../types/raml';
const tools = require('datatype-expansion');

export default class RequestTransformer {
  public static execute(spec: Specification, operation: Method, headers: Header[]): Request {
    const object = operation.toJSON({ serializeMetadata: false });
    const bodies = object.body || {};
    const request: Request = {
      headers,
      description: undefined,
      body: Object.keys(bodies).length > 0 ? {} : undefined,
    };

    for (const mime of Object.keys(bodies)) {
      const mediaType = mime;
      const bodyItem = bodies[mime];
      const examples = [];
      if (bodyItem.example) {
        examples.push(bodyItem.example);
      }
      if (bodyItem.examples && bodyItem.examples.length > 0) {
        for (const example of bodyItem.examples) {
          examples.push(example);
        }
      }
      const expanded = tools.expandedForm(bodyItem.type, spec.types);
      const canonical: CanonicalType = tools.canonicalForm(expanded);
      // @ts-ignore
      request.body[mediaType] = {
        mediaType: mediaType,
        schema: SchemaTransformer.transform(canonical),
        examples: examples,
      };
    }

    return request;
  }
}
