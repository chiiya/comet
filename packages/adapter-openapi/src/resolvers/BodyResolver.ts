import { OpenAPIMediaType, OpenAPIMediaTypes } from '../../types/open-api';
import { Bodies, Schema } from '@comet-cli/types';
import { SchemaType } from '../../types/helpers';
import Specification from '../Specification';
import SchemaTransformer from '../transformers/SchemaTransformer';
import SchemaValueResolver from './SchemaValueResolver';

export default class BodyResolver {
  /**
   * Create a request body and infer its attribute values.
   * @param spec
   * @param contents
   * @param type
   * @throws Error
   * @throws UnresolvableParameterError
   */
  public static execute(
    spec: Specification,
    contents: OpenAPIMediaTypes,
    type: SchemaType = 'other',
  ): Bodies | undefined {
    const bodies: Bodies = {};
    if (contents === undefined) {
      return undefined;
    }
    for (const mime of Object.keys(contents)) {
      spec.resetVisited();
      const content = contents[mime];
      const requestSchema = content.schema;
      const schema = requestSchema ? SchemaTransformer.execute(spec, requestSchema, type) : undefined;
      bodies[mime] = {
        mediaType: mime,
        schema: schema,
        examples: this.resolveExamples(spec, content, schema),
      };
    }

    return bodies;
  }

  protected static resolveExamples(spec: Specification, content: OpenAPIMediaType, schema: Schema | undefined): any[] {
    const examples = [];
    if (content.hasOwnProperty('example')) {
      examples.push(content.example);
    }
    if (content.examples) {
      for (const name of Object.keys(content.examples)) {
        const example = spec.deref(content.examples[name]);
        if (example.value) {
          examples.push(example.value);
        }
        if (example.externalValue) {
          examples.push(example.externalValue);
        }
        spec.exitRef(content.examples[name]);
      }
    }
    if (schema !== undefined) {
      const result = SchemaValueResolver.execute(schema);
      if (result !== undefined) {
        examples.push(result);
      }
    }

    return examples;
  }
}
