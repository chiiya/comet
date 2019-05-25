import { Schema, JsonSchema } from '@comet-cli/types';

export default class JsonSchemaTransformer {
  /**
   * Execute the transformer.
   * @param schema
   */
  static execute(schema: Schema): JsonSchema {
    const transformed = this.transformSchema(schema);
    transformed.$schema = 'http://json-schema.org/draft-04/schema#';
    return transformed;
  }

  /**
   * Converts a Comet Schema definition to a valid JSON Schema definition.
   * @param schema
   */
  static transformSchema(schema: Schema): JsonSchema {
    const transformed = { ...schema };
    delete transformed.discriminator;
    delete transformed.xml;
    delete transformed.example;
    // Transform nested schema definitions
    const nested: (keyof Schema)[] = ['allOf', 'oneOf', 'anyOf', 'not', 'items', 'additionalProperties'];
    for (const struct of nested) {
      if (Array.isArray(transformed[struct])) {
        for (let i = 0; i < transformed[struct].length; i = i + 1) {
          transformed[struct][i] = this.transformSchema(schema[struct][i]);
        }
      } else if (typeof transformed[struct] === 'object') {
        transformed[struct] = this.transformSchema(schema[struct]);
      }
    }
    // Transform properties, which are also schema definitions
    if (transformed.properties && typeof transformed.properties === 'object') {
      for (const key of Object.keys(transformed.properties)) {
        // @ts-ignore
        transformed.properties[key] = this.transformSchema(schema.properties[key]);
      }
    }

    return <JsonSchema>transformed;
  }
}
