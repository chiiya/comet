import { Schema } from '../types/schema';

export default class Transformer {
  /**
   * Execute the transformer.
   * @param schema
   */
  static execute(schema: Schema): Schema {
    const transformed = this.transformSchema(schema);
    transformed['$schema'] = 'http://json-schema.org/draft-04/schema#';

    return transformed;
  }

  /**
   * Converts an OpenAPI schema to a valid JSON schema
   * @see https://github.com/OAI/OpenAPI-Specification/blob/OpenAPI.next/versions/3.0.0.md#schemaObject
   * @param schema
   */
  static transformSchema(schema: Schema): Schema {
    let transformed = schema;
    // Step 1: Transform type
    transformed = this.transformType(transformed);
    // Step 2: Transform nested schema definitions
    const nested = ['allOf', 'oneOf', 'anyOf', 'not', 'items', 'additionalProperties'];
    nested.forEach((struct) => {
      if (Array.isArray(transformed[struct])) {
        for (let i = 0; i < transformed[struct].length; i = i + 1) {
          transformed[struct][i] = this.transformSchema(transformed[struct][i]);
        }
      } else if (typeof transformed[struct] === 'object') {
        transformed[struct] = this.transformSchema(transformed[struct]);
      }
    });
    // Step 3: Transform properties, which are also schema definitions
    if (typeof transformed.properties === 'object') {
      Object.keys(transformed.properties).forEach((key: string) => {
        transformed.properties[key] = this.transformSchema(transformed.properties[key]);
      });
    }
    const notSupported = [
      'nullable', 'discriminator', 'readOnly', 'writeOnly', 'xml',
      'externalDocs', 'example', 'deprecated',
    ];
    notSupported.forEach((property) => {
      delete transformed[property];
    });

    return transformed;
  }

  protected static transformType(schema: Schema) {
    if (schema.type !== undefined && typeof schema.type === 'string' && schema.nullable === true) {
      schema.type = [schema.type, 'null'];

      if (Array.isArray(schema.enum)) {
        schema.enum = schema.enum.concat([null]);
      }
    }

    return schema;
  }
}
