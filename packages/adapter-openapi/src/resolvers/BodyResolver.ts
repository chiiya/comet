import { OpenAPIMediaType, OpenAPIMediaTypes } from '../../types/open-api';
import { Bodies } from '@comet-cli/types';
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
      const content = contents[mime];
      const schema = content.schema;
      bodies[mime] = {
        mediaType: mime,
        schema: schema ? SchemaTransformer.execute(spec, schema, type) : undefined,
        examples: this.resolveExamples(spec, content),
      };
    }

    return bodies;
  }

  protected static resolveExamples(spec: Specification, content: OpenAPIMediaType): any[] {
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
    if (content.schema) {
      const schema = spec.deref(content.schema);
      const result = SchemaValueResolver.execute(schema);
      spec.exitRef(content.schema);
      if (result !== undefined) {
        examples.push(result);
      }
    }

    return examples;
  }
}
