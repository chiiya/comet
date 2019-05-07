import SchemaValueResolver from './SchemaValueResolver';
import { OpenAPIMediaType, OpenAPIMediaTypes } from '../types/open-api';
import { Bodies } from '@comet-cli/types';
import Transformer from './Transformer';
import { ParameterType } from '../types/helpers';

export default class BodyResolver {
  /**
   * Create a request body and infer its attribute values.
   * @param contents
   * @param type
   * @throws Error
   * @throws UnresolvableParameterError
   */
  public static execute(contents: OpenAPIMediaTypes, type: ParameterType = 'other'): Bodies {
    const bodies: Bodies = {};
    if (contents === undefined) {
      return null;
    }
    for (const mime of Object.keys(contents)) {
      const content = contents[mime];
      const schema = content.schema;
      bodies[mime] = {
        mediaType: mime,
        schema: schema ? Transformer.execute(content.schema, type) : null,
        examples: this.resolveExamples(content),
      };
    }

    return bodies;
  }

  protected static resolveExamples(content: OpenAPIMediaType): any[] {
    const examples = [];
    if (content.hasOwnProperty('example')) {
      examples.push(content.example);
    }
    if (content.examples) {
      for (const name of Object.keys(content.examples)) {
        const example = content.examples[name];
        if (example.value) {
          examples.push(example.value);
        }
        if (example.externalValue) {
          examples.push(example.externalValue);
        }
      }
    }
    if (content.schema) {
      const result = SchemaValueResolver.execute(content.schema);
      if (result !== undefined) {
        return result;
      }
    }

    return examples;
  }
}
