import { OpenAPISchema, JsonSchema } from '@comet-cli/types';
import { ParameterType } from '../types/helpers';

export default class Transformer {
  /**
   * Execute the transformer.
   * @param schema
   * @param type
   */
  public static execute(schema: OpenAPISchema, type: ParameterType = 'other'): JsonSchema {
    const transformed = this.transformSchema(schema, type);
    transformed.$schema = 'http://json-schema.org/draft-04/schema#';

    return transformed;
  }

  /**
   * Converts an OpenAPI schema to a valid JSON schema
   * Keeps XML and (adjusted) discriminator properties. While technically it's not a 100% valid
   * JSON schema, most tools will just ignore these properties.
   * @see https://github.com/OAI/OpenAPI-Specification/blob/OpenAPI.next/versions/3.0.0.md#schemaObject
   * @param schema
   * @param type
   */
  protected static transformSchema(schema: OpenAPISchema, type: ParameterType): JsonSchema {
    const transformed: JsonSchema = JSON.parse(JSON.stringify(schema));
    // Step 1: Transform type
    if (schema.type !== undefined) {
      transformed.type = this.transformType(schema);
    }
    // Step 1.5: Transform enum
    if (Array.isArray(schema.enum)) {
      transformed.enum = this.transformEnum(schema);
    }
    if (schema.discriminator) {
      transformed.discriminator = this.transformDiscriminator(schema);
    }
    // Step 2: Transform nested schema definitions
    const nested = ['allOf', 'oneOf', 'anyOf', 'not', 'items', 'additionalProperties'];
    nested.forEach((struct) => {
      if (Array.isArray(transformed[struct])) {
        for (let i = 0; i < transformed[struct].length; i = i + 1) {
          transformed[struct][i] = this.transformSchema(schema[struct][i], type);
        }
      } else if (typeof transformed[struct] === 'object') {
        transformed[struct] = this.transformSchema(schema[struct], type);
      }
    });
    // Step 3: Transform properties, which are also schema definitions
    if (typeof transformed.properties === 'object') {
      for (const name of Object.keys(transformed.properties)) {
        const property = schema.properties[name];
        // Remove read-only properties from request schemas and write-only properties from
        // response schemas.
        if ((type === 'request' && property.readOnly) || (type === 'response' && property.writeOnly)) {
          delete transformed.properties[name];
        }
        transformed.properties[name] = this.transformSchema(schema.properties[name], type);
      }
    }
    // Step 4: Remove unsupported properties
    const notSupported = [
      'nullable', 'readOnly', 'writeOnly',
      'externalDocs', 'example', 'deprecated',
    ];
    notSupported.forEach((property) => {
      delete transformed[property];
    });

    return transformed;
  }

  protected static removeCircularReferences(schema: OpenAPISchema) {
    Object.keys(schema).forEach((key) => {
      if (typeof schema[key] === 'object') {
        this.removeCircularReferences(schema[key]);
      }
      if (key === '$ref') {
        delete schema[key];
      }
    });
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

  /**
   * Transform discriminator definition.
   * @param schema
   */
  protected static transformDiscriminator(schema: OpenAPISchema): string {
    if (schema.discriminator && schema.discriminator.propertyName) {
      return schema.discriminator.propertyName;
    }
  }
}
