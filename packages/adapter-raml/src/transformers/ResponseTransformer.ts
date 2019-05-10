import Specification from '../Specification';
import { Bodies, Responses } from '@comet-cli/types';
import { Response } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import HeaderTransformer from './HeaderTransformer';
import SchemaTransformer from './SchemaTransformer';
import { CanonicalType } from '../../types/raml';
const tools = require('datatype-expansion');

export default class ResponseTransformer {
  public static execute(spec: Specification, specResponses: Response[]): Responses {
    const responses: Responses = {};
    for (const response of specResponses) {
      const object = response.toJSON({ serializeMetadata: false });
      const code = object.code;
      const headers = response.headers() || [];
      const description = response.description();
      const bodies = object.body || {};
      const body: Bodies = {};
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
        body[mediaType] = {
          mediaType: mediaType,
          schema: SchemaTransformer.transform(canonical),
          examples: examples,
        };
      }
      responses[code] = {
        statusCode: Number(code),
        description: description ? description.value() : null,
        headers: HeaderTransformer.execute(spec, headers),
        body: body,
      };
    }

    return responses;
  }
}
