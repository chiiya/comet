import Specification from '../Specification';
import { Bodies, Responses } from '@comet-cli/types';
import { Response } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import ParsingException from '../ParsingException';
import HeaderTransformer from './HeaderTransformer';
import SchemaTransformer from './SchemaTransformer';

export default class ResponseTransformer {
  public static execute(spec: Specification, specResponses: Response[]): Responses {
    const responses: Responses = {};
    for (const response of specResponses) {
      const code = response.code() ? response.code().value() : null;
      if (code === null) {
        throw new ParsingException('Missing status code for response');
      }
      const headers = response.headers() || [];
      const description = response.description();
      const bodies = response.body();
      const body: Bodies = {};
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
        bodies[mediaType] = {
          mediaType: mediaType,
          schema: SchemaTransformer.execute(spec, body),
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
