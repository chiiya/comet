import { Schema, JsonSchema } from '@comet-cli/types';

export class JsonSchemaTransformer {
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
    delete schema.discriminator;
    delete schema.xml;
    const transformed = <JsonSchema>{ ...schema };
    // Transform nested schema definitions
    const nested = ['allOf', 'oneOf', 'anyOf', 'not', 'items', 'additionalProperties'];
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
    if (typeof transformed.properties === 'object') {
      Object.keys(transformed.properties).forEach((key: string) => {
        transformed.properties[key] = this.transformSchema(schema.properties[key]);
      });
    }

    return transformed;
  }
}
