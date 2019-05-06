import { OpenAPISchema, JsonSchema } from '@comet-cli/types';

export default class Transformer {
  /**
   * Execute the transformer.
   * @param schema
   */
  static execute(schema: OpenAPISchema): JsonSchema {
    const transformed = this.transformSchema(schema);
    transformed.$schema = 'http://json-schema.org/draft-04/schema#';

    return transformed;
  }

  /**
   * Converts an OpenAPI schema to a valid JSON schema
   * @see https://github.com/OAI/OpenAPI-Specification/blob/OpenAPI.next/versions/3.0.0.md#schemaObject
   * @param schema
   */
  static transformSchema(schema: OpenAPISchema): JsonSchema {
    const transformed: JsonSchema = JSON.parse(JSON.stringify(schema));
    // Step 1: Transform type
    if (schema.type !== undefined) {
      transformed.type = this.transformType(schema);
    }
    // Step 1.5: Transform enum
    if (Array.isArray(schema.enum)) {
      transformed.enum = this.transformEnum(schema);
    }
    // Step 2: Transform nested schema definitions
    const nested = ['allOf', 'oneOf', 'anyOf', 'not', 'items', 'additionalProperties'];
    nested.forEach((struct) => {
      if (Array.isArray(transformed[struct])) {
        for (let i = 0; i < transformed[struct].length; i = i + 1) {
          transformed[struct][i] = this.transformSchema(schema[struct][i]);
        }
      } else if (typeof transformed[struct] === 'object') {
        transformed[struct] = this.transformSchema(schema[struct]);
      }
    });
    // Step 3: Transform properties, which are also schema definitions
    if (typeof transformed.properties === 'object') {
      Object.keys(transformed.properties).forEach((key: string) => {
        transformed.properties[key] = this.transformSchema(schema.properties[key]);
      });
    }
    // Step 4: Remove unsupported properties
    const notSupported = [
      'nullable', 'discriminator', 'readOnly', 'writeOnly',
      'externalDocs', 'example', 'deprecated',
    ];
    notSupported.forEach((property) => {
      delete transformed[property];
    });

    return transformed;
  }

  /**
   * Transform type definition.
   * @param schema
   */
  protected static transformType(schema: OpenAPISchema): string | string[] {
    if (typeof schema.type === 'string' && schema.nullable === true) {
      return [schema.type, 'null'];
    }

    return schema.type;
  }

  /**
   * Transform enum definition.
   * @param schema
   */
  protected static transformEnum(schema: OpenAPISchema): any[] {
    if (typeof schema.type === 'string' && schema.nullable === true) {
      return schema.enum.concat([null]);
    }

    return schema.enum;
  }
}
