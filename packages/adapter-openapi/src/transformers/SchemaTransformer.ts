import Specification from '../Specification';
import { OpenAPISchema, Referenced } from '../../types/open-api';
import { Schema } from '@comet-cli/types';
import { SchemaType } from '../../types/helpers';

export type MergedOpenAPISchema = OpenAPISchema & { parentRefs?: string[] };

export default class SchemaTransformer {
  public static execute(spec: Specification, ref: Referenced<OpenAPISchema>, type: SchemaType = 'other'): Schema {
    const $ref = ref.$ref;
    let rawSchema = spec.deref(ref);
    rawSchema = this.mergeAllOf(spec, rawSchema, $ref);
    const schema: Schema = {};
    const isCircular = !!rawSchema['x-circular-ref'];

    if (isCircular) {
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
    spec.exitParents(rawSchema);

    return schema;
  }

  /**
   * Transform type definition.
   * @param schema
   */
  protected static transformType(schema: OpenAPISchema): string | string[] | undefined {
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
  protected static transformEnum(schema: OpenAPISchema): any[] | undefined {
    if (schema.enum && typeof schema.type === 'string' && schema.nullable === true) {
      return schema.enum.concat([null]);
    }

    return schema.enum;
  }

  /**
   * Transform discriminator definition.
   * @param schema
   */
  protected static transformDiscriminator(schema: OpenAPISchema): string | undefined {
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
      // @ts-ignore
      if (schema[keyword] !== undefined) {
        return type;
      }
    }
  }

  /**
   * Merge and remove allOf sub-schema definitions.
   * @param spec
   * @param schema
   * @param $ref
   */
  protected static mergeAllOf(
    spec: Specification,
    schema: OpenAPISchema,
    $ref: string | undefined,
  ): MergedOpenAPISchema {
    const allOf = schema.allOf;

    if (allOf === undefined) {
      return schema;
    }

    let merged: MergedOpenAPISchema = {
      ...schema,
      allOf: undefined,
      parentRefs: [],
    };

    const allOfSchemas = allOf.map((subSchema) => {
      const resolved = spec.deref(subSchema);
      const subRef = subSchema.$ref || undefined;
      const subMerged = this.mergeAllOf(spec, resolved, subRef);
      merged.parentRefs!.push(...(subMerged.parentRefs || []));
      return {
        $ref: subRef,
        schema: subMerged,
      };
    });

    for (const { $ref: subSchemaRef, schema: subSchema } of allOfSchemas) {
      if (
        merged.type !== subSchema.type
        && merged.type !== undefined
        && subSchema.type !== undefined
      ) {
        throw new Error(`Incompatible types in allOf at "${$ref}"`);
      }

      if (subSchema.type !== undefined) {
        merged.type = subSchema.type;
      }

      if (subSchema.properties !== undefined) {
        merged.properties = merged.properties || {};
        for (const prop in subSchema.properties) {
          if (!merged.properties[prop]) {
            merged.properties[prop] = subSchema.properties[prop];
          } else {
            // merge inner properties
            merged.properties[prop] = this.mergeAllOf(
              spec,
              { allOf: [merged.properties[prop], subSchema.properties[prop]] },
              `${$ref}/properties/${prop}`,
            );
          }
        }
      }

      if (subSchema.items !== undefined) {
        merged.items = merged.items || {};
        // merge inner properties
        merged.items = this.mergeAllOf(
          spec,
          { allOf: [merged.items, subSchema.items] },
          `${$ref}/items`,
        );
      }

      if (subSchema.required !== undefined) {
        merged.required = [...new Set((merged.required || []).concat(subSchema.required))];
      }

      // merge rest of constraints
      merged = { ...subSchema, ...merged };

      if (subSchemaRef) {
        merged.parentRefs!.push(subSchemaRef);
      }
    }

    return merged;
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
  protected static getTypeKeywords(): {[key: string]: string} {
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
