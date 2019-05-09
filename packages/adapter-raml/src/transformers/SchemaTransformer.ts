import { TypeDeclaration } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Schema } from '@comet-cli/types';
import * as constants from 'ramldt2jsonschema/src/constants';
const raml2json = require('ramldt2jsonschema');

export default class SchemaTransformer {
  public static execute(declaration: TypeDeclaration): Schema {
    return this.transform(declaration.toJSON());
  }

  public static transform(declaration: any): Schema {
    const schema: Schema = {};
    this.transformType(schema, declaration);
    this.transformBasicValues(schema, declaration);
    this.transformXml(schema, declaration);

    // Transform nested property declarations
    if (declaration.properties) {
      const properties = declaration.properties;
      const required = [];
      schema.properties = {};
      for (const property of properties) {
        if (property.required === true) {
          required.push(property.name);
        }
        schema.properties[property.name] = this.execute(property);
      }
      if (required.length > 0) {
        schema.required = required;
      }
    }

    // Transform nested array item declarations
    if (declaration.items) {
      schema.items = this.transform(declaration.items);
    }

    return schema;
  }

  protected static transformType(schema: Schema, declaration: any): void {
    const type = declaration.type;
    const format = declaration.format;

    // Set default types if not type definition is present
    if (type === undefined) {
      if (declaration.properties) {
        schema.type = 'object';
      } else {
        schema.type = 'string';
      }
      return;
    }

    const transformed = [];
    for (const item of type || []) {
      switch (item) {
        case 'date-only':
          transformed.push('string');
          schema.pattern = constants.dateOnlyPattern;
          break;
        case 'time-only':
          transformed.push('string');
          schema.pattern = constants.timeOnlyPattern;
          break;
        case 'datetime-only':
          transformed.push('string');
          schema.pattern = constants.dateTimeOnlyPattern;
          break;
        case 'datetime':
          transformed.push('string');
          if (format === undefined || format.toLowerCase() === constants.RFC3339) {
            schema.pattern = constants.RFC3339DatetimePattern;
          } else if (format.toLowerCase() === constants.RFC2616) {
            schema.pattern = constants.RFC2616DatetimePattern;
          }
          break;
        case 'union':
          // If union of arrays
          // if (Array.isArray(data.anyOf) && data.anyOf[0].type === 'array') {
          //   const items = data.anyOf.map(e => e.items);
          //   data.items = { anyOf: [] };
          //   data.items.anyOf = items;
          //   data['type'] = 'array';
          //   delete data.anyOf;
          // } else {
          //   data['type'] = 'object';
          // }
          transformed.push('object');
          break;
        case 'nil':
          transformed.push('null');
          break;
        case 'file':
          transformed.push('string');
          break;
        default:
          transformed.push(item);
      }
    }
    // Apply the transformed types to the schema.
    const unique = [...new Set(transformed)];
    if (unique.length === 0) {
      schema.type = undefined;
    } else if (unique.length === 1) {
      schema.type = unique[0];
    } else {
      schema.type = unique;
    }
  }

  /**
   * Copy over all the basic, compatible values.
   * @param schema
   * @param declaration
   */
  protected static transformBasicValues(schema: Schema, declaration: any): void {
    // Transform schema title
    if (declaration.displayName) {
      schema.title = declaration.displayName;
    }

    const properties = [
      'description',
      'default',
      'enum',
      'format',
      'discriminator',
      'minItems',
      'maxItems',
      'pattern',
      'minLength',
      'maxLength',
      'minimum',
      'maximum',
      'multipleOf',
      'minProperties',
      'maxProperties',
      'uniqueItems',
      'additionalProperties',
    ];

    for (const property of properties) {
      if (declaration[property] !== undefined) {
        schema[property] = declaration[property];
      }
    }
  }

  protected static transformXml(schema: Schema, declaration: any) {
    if (declaration.xml) {
      schema.xml = {
        attribute: declaration.xml.attribute || false,
        name: declaration.xml.name || undefined,
        namespace: declaration.xml.namespace || undefined,
        prefix: declaration.xml.prefix || undefined,
        wrapped: declaration.xml.wrapped || false,
      };
    }
  }
}
