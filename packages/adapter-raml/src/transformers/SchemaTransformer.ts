import {
  TypeDeclaration,
} from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Schema } from '@comet-cli/types';
import Specification from '../Specification';
import { CanonicalType } from '../../types/raml';
const tools = require('datatype-expansion');
const constants = require('ramldt2jsonschema/src/constants');

export default class SchemaTransformer {
  public static execute(spec: Specification, declaration: TypeDeclaration): Schema {
    const object = declaration.toJSON({ serializeMetadata: false });
    const expanded = tools.expandedForm(object, spec.types);
    const canonical: CanonicalType = tools.canonicalForm(expanded);
    return this.transform(canonical);
  }

  public static transform(canonical: CanonicalType): Schema {
    const schema: Schema = {};
    this.transformType(schema, canonical);
    this.transformProperties(schema, canonical);
    this.transformNested(schema, canonical);
    this.transformFacets(schema, canonical);
    this.transformXmlProperties(schema, canonical);
    this.transformPatternProperties(schema, canonical);
    return schema;
  }

  protected static transformType(schema: Schema, canonical: CanonicalType): void {
    // Set default types if no type definition is present
    if (canonical.type === undefined) {
      if (canonical.properties !== undefined) {
        schema.type = 'object';
      } else {
        schema.type = 'string';
      }
      return;
    }
    // If union of arrays
    const subSchemas = canonical.anyOf || [];
    if (canonical.type === 'union' && subSchemas.length > 0 && subSchemas[0].type === 'array') {
      const items = subSchemas.map(subSchema => this.transform(<CanonicalType>subSchema.items));
      schema.items = { anyOf: [] };
      schema.items.anyOf = items;
      schema.type = 'array';
      delete schema.anyOf;
    } else {
      const { type, pattern } = this.guessTypeFromNameAndFormat(canonical);
      schema.type = type;
      schema.pattern = pattern;
    }
  }

  protected static guessTypeFromNameAndFormat(canonical: CanonicalType): { type: string | undefined, pattern: string } {
    let type;
    let pattern = undefined;
    const name = canonical.type;
    const format = canonical.format;

    switch (name) {
      case 'string':
      case 'boolean':
      case 'number':
      case 'integer':
      case 'array':
      case 'object':
        type = name;
        break;
      case 'date-only':
        type = 'string';
        pattern = constants.dateOnlyPattern;
        break;
      case 'time-only':
        type = 'string';
        pattern = constants.timeOnlyPattern;
        break;
      case 'datetime-only':
        type = 'string';
        pattern = constants.dateTimeOnlyPattern;
        break;
      case 'datetime':
        type = 'string';
        if (format === undefined || format.toLowerCase() === constants.RFC3339) {
          pattern = constants.RFC3339DatetimePattern;
        } else if (format.toLowerCase() === constants.RFC2616) {
          pattern = constants.RFC2616DatetimePattern;
        }
        break;
      case 'union':
        // Make sure there are no conflicting types. If they are conflicting, we cannot
        // explicitly set a type on the parent.
        const types = [];
        for (const subSchema of canonical.anyOf || []) {
          types.push(subSchema.type);
        }
        const unique = [...new Set(types)];
        if (unique.length === 1) {
          type = unique[0];
        }
        break;
      case 'nil':
        type = 'null';
        break;
      case 'file':
        type = 'string';
        break;
    }

    return {
      type,
      pattern,
    };
  }

  protected static transformFacets(schema: Schema, canonical: CanonicalType): void {
    const compatible = [
      'default', 'description', 'uniqueItems', 'minItems', 'maxItems', 'minProperties',
      'maxProperties', 'additionalProperties', 'discriminator', 'enum', 'pattern', 'minLength',
      'maxLength', 'minimum', 'maximum', 'format', 'multipleOf'];
    for (const key of compatible) {
      if (canonical[key] !== undefined) {
        schema[key] = canonical[key];
      }
    }
    // All type definitions have a display name in RAML, by default it's just the property name,
    // which is useless information. Only set it if it's different
    if (canonical.displayName && canonical.displayName !== canonical.name) {
      schema.title = canonical.displayName;
    }
  }

  protected static transformNested(schema: Schema, canonical: CanonicalType): void {
    // Transform nested schema definitions
    const nested = ['allOf', 'anyOf', 'items'];
    for (const struct of nested) {
      if (canonical[struct] === undefined) {
        continue;
      }
      if (Array.isArray(canonical[struct])) {
        schema[struct] = [];
        for (let i = 0; i < canonical[struct].length; i = i + 1) {
          schema[struct][i] = this.transform(canonical[struct][i]);
        }
      } else if (typeof canonical[struct] === 'object') {
        schema[struct] = this.transform(canonical[struct]);
      }
    }
  }

  protected static transformProperties(schema: Schema, canonical: CanonicalType): void {
    // Transform properties, which are also schema definitions
    if (canonical.properties !== undefined && typeof canonical.properties === 'object') {
      schema.properties = {};
      const required = [];
      for (const name of Object.keys(canonical.properties)) {
        const property = canonical.properties[name];
        if (property.required === true) {
          required.push(name);
        }
        schema.properties[name] = this.transform(canonical.properties[name]);
      }
      if (required.length > 0) {
        schema.required = required;
      }
    }
  }

  protected static transformXmlProperties(schema: Schema, canonical: CanonicalType): void {
    if (canonical.xml) {
      schema.xml = {
        attribute: canonical.xml.attribute || undefined,
        name: canonical.xml.name || undefined,
        namespace: canonical.xml.namespace || undefined,
        prefix: canonical.xml.prefix || undefined,
        wrapped: canonical.xml.wrapped || undefined,
      };
    }
  }

  protected static transformPatternProperties(schema: Schema, canonical: CanonicalType): void {
    const keys = Object.keys(canonical.properties || {});
    for (const key of keys) {
      if (/^\/.*\/$/.test(key)) {
        schema['patternProperties'] = canonical['patternProperties'] || {};
        const stringRegex = key.slice(1, -1);
        // @ts-ignore
        schema['patternProperties'][stringRegex] = canonical.properties[key];
        // @ts-ignore
        delete schema.properties[key];
      }
    }
  }
}
