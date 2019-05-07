import Specification from '../Specification';
import { OpenAPISchema, Referenced } from '../../types/open-api';
import { JsonSchema } from '@comet-cli/types';
import { SchemaType } from '../../types/helpers';

export default class SchemaTransformer {
  public static execute(spec: Specification, ref: Referenced<OpenAPISchema>, type: SchemaType = 'other'): JsonSchema {
    const rawSchema = spec.deref(ref);
    const schema: JsonSchema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
    };
    const isCircular = !!rawSchema['x-circular-ref'];

    if (isCircular === true) {
      schema['x-circular-ref'] = true;
      spec.exitRef(ref);
      return schema;
    }

    // Copy regular properties
    for (const property of this.getCompatibleProperties()) {
      schema[property] = rawSchema[property];
    }
    // Transform type
    if (rawSchema.type !== undefined) {
      schema.type = this.transformType(rawSchema);
    }
    // Transform enum
    if (Array.isArray(rawSchema.enum)) {
      schema.enum = this.transformEnum(rawSchema);
    }
    // Transform discriminator
    if (rawSchema.discriminator) {
      schema.discriminator = this.transformDiscriminator(rawSchema);
    }

    // Transform nested schema definitions
    const nested = ['allOf', 'oneOf', 'anyOf', 'not', 'items', 'additionalProperties'];
    for (const struct of nested) {
      if (rawSchema[struct] === undefined) {
        continue;
      }
      if (Array.isArray(rawSchema[struct])) {
        schema[struct] = [];
        for (let i = 0; i < rawSchema[struct].length; i = i + 1) {
          schema[struct][i] = this.execute(spec, rawSchema[struct][i], type);
        }
      } else if (typeof rawSchema[struct] === 'object') {
        schema[struct] = this.execute(spec, rawSchema[struct], type);
      }
    }
    // Transform properties, which are also schema definitions
    if (rawSchema.properties !== undefined && typeof rawSchema.properties === 'object') {
      schema.properties = {};
      for (const name of Object.keys(rawSchema.properties)) {
        const property = rawSchema.properties[name];
        // Remove read-only properties from request schemas and write-only properties from
        // response schemas.
        if ((type === 'request' && property.readOnly) || (type === 'response' && property.writeOnly)) {
          delete rawSchema.properties[name];
        } else {
          schema.properties[name] = this.execute(spec, rawSchema.properties[name], type);
        }
      }
    }

    spec.exitRef(ref);

    return schema;
  }

  /**
   * Transform type definition.
   * @param schema
   */
  protected static transformType(schema: OpenAPISchema): string | string[] {
    const type = this.detectType(schema);
    if (typeof type === 'string' && schema.nullable === true) {
      return [type, 'null'];
    }

    return type;
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

  /**
   * Attempt to automatically detect the type of a schema, if not specified explicitly.
   * @param schema
   */
  protected static detectType(schema: OpenAPISchema): string | undefined {
    if (schema.type !== undefined) {
      return schema.type;
    }
    const keywords = this.getTypeKeywords();
    for (const keyword of Object.keys(keywords)) {
      const type = keywords[keyword];
      if (schema[keyword] !== undefined) {
        return type;
      }
    }
  }

  /**
   * Get a list of OpenAPI Schema properties that are compatible with JSON Schema.
   */
  protected static getCompatibleProperties(): string[] {
    return [
      'description',
      'default',
      'required',
      'format',
      'title',
      'multipleOf',
      'maximum',
      'exclusiveMaximum',
      'minimum',
      'exclusiveMinimum',
      'maxLength',
      'minLength',
      'pattern',
      'maxItems',
      'minItems',
      'uniqueItems',
      'maxProperties',
      'minProperties',
      'xml',
      'x-circular-ref',
    ];
  }

  /**
   * Get a list of keywords that indicate a certain type in a JSON Schema.
   */
  protected static getTypeKeywords(): object {
    return {
      multipleOf: 'number',
      maximum: 'number',
      exclusiveMaximum: 'number',
      minimum: 'number',
      exclusiveMinimum: 'number',

      maxLength: 'string',
      minLength: 'string',
      pattern: 'string',

      items: 'array',
      maxItems: 'array',
      minItems: 'array',
      uniqueItems: 'array',

      maxProperties: 'object',
      minProperties: 'object',
      required: 'object',
      additionalProperties: 'object',
      properties: 'object',
    };
  }
}
