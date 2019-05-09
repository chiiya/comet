import {
  ArrayTypeDeclaration, isUnionTypeDeclaration,
  ObjectTypeDeclaration,
  TypeDeclaration,
} from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Schema } from '@comet-cli/types';
import * as constants from 'ramldt2jsonschema/src/constants';
import Specification from '../Specification';
import { ITypeDefinition } from 'raml-1-parser/dist/parser/highLevelAST';

export default class SchemaTransformer {
  public static execute(spec: Specification, declaration: TypeDeclaration): Schema {
    const schema: Schema = {};
    this.transformType(schema, declaration);
    this.transformFacets(schema, declaration);
    switch (declaration.kind()) {
      case 'ArrayTypeDeclaration':
        this.transformArrayProperties(spec, schema, <ArrayTypeDeclaration>declaration);
        break;
      case 'ObjectTypeDeclaration':
        this.transformObjectProperties(spec, schema, <ObjectTypeDeclaration>declaration);
        break;
    }
    this.transformXmlProperties(schema, declaration);
    return schema;
  }

  public static getFacets(declaration: ITypeDefinition): any {
    if (declaration.superTypes().length === 0) {
      return declaration.fixedBuiltInFacets();
    }
    return { ...this.getFacets(declaration.superTypes()[0]), ...declaration.fixedBuiltInFacets() };
  }

  protected static transformXmlProperties(schema: Schema, declaration: TypeDeclaration): void {
    if (declaration.xml()) {
      schema.xml = {
        attribute: declaration.xml().attribute() || false,
        name: declaration.xml().name() || undefined,
        namespace: declaration.xml().namespace() || undefined,
        prefix: declaration.xml().prefix() || undefined,
        wrapped: declaration.xml().wrapped() || false,
      };
    }
  }

  protected static transformArrayProperties(
    spec: Specification,
    schema: Schema,
    declaration: ArrayTypeDeclaration,
  ): void {
    const items = declaration.items();
    const structuredItems = declaration.structuredItems();
    const component = declaration.findComponentTypeDeclaration();
    if (component !== null) {
      schema.items = this.execute(spec, component);
      return;
    }
    if (items !== null && items.length > 0) {
      // Simple, non-user defined item types.
      const { type, pattern } = this.guessTypeFromNameAndFormat(items);
      schema.items = { pattern, type: type || 'string' };
      return;
    }
    if (structuredItems !== null) {
      // Simple type definition (just the type)
      if (structuredItems.isScalar() && structuredItems.value()) {
        schema.items = { type: structuredItems.value() };
        return;
      }
      // Both the AST and the low-level runtime type are useless for resolving inline item definitions.
      if (structuredItems.properties() && structuredItems.properties().length > 0) {
        const runtimeType = declaration.runtimeType();
        // @ TODO Resolve this. Most use cases are supported right now, but some inline
        // declarations are not
        // for (const item of structuredItems.properties()) {
        //   console.log(item.name(), item.value().value());
        // }
      }
    }
  }

  protected static transformObjectProperties(
    spec: Specification,
    schema: Schema,
    declaration: ObjectTypeDeclaration,
  ): void {
    const runtimeType = declaration.runtimeType();
    // Get properties of this type definition and of all super-types.
    const properties = runtimeType.allProperties() || [];
    if (properties.length > 0) {
      const required = [];
      schema.properties = {};
      for (const property of properties) {
        if (property.isRequired() === true) {
          required.push(property.nameId());
        }
        // Unfortunately the property we have here is not the TypeDeclaration we want.
        // We _do_ know now however which type this property belongs to, so we will query the
        // type definitions for that type, then resolve the property definition and attach it
        // to this schema.
        const type = <ObjectTypeDeclaration>spec.api.types().find(item => item.name() === property.domain().nameId());
        if (type && type.properties()) {
          const resolved = type.properties().find(item => item.name() === property.nameId());
          schema.properties[property.nameId()] = this.execute(spec, resolved);
        } else {
          // Inline declaration
          const inlineProperties = declaration.properties();
          const resolved = inlineProperties.find(item => item.name() === property.nameId());
          schema.properties[property.nameId()] = this.execute(spec, resolved);
        }
      }
      if (required.length > 0) {
        schema.required = required;
      }
    }
  }

  protected static transformFacets(schema: Schema, declaration: TypeDeclaration): void {
    const facets = this.getFacets(declaration.runtimeType());
    for (const [key, value] of Object.entries(facets)) {
      if ([
        'default', 'description', 'uniqueItems', 'minItems', 'maxItems', 'minProperties',
        'maxProperties', 'additionalProperties', 'discriminator', 'enum', 'pattern', 'minLength',
        'maxLength', 'minimum', 'maximum', 'format', 'multipleOf'].includes(key)) {
        schema[key] = value;
      }
      // All type definitions have a display name in RAML, by default it's just the property name,
      // which is useless information. Only set it if it's different
      if (key === 'displayName' && value !== declaration.name()) {
        console.log(value, declaration.name());
        schema.title = <string>value;
      }
    }
  }

  protected static transformType(schema: Schema, declaration: TypeDeclaration): void {
    const types = declaration.type();
    const kind = declaration.kind();

    // @TODO: Deal with this
    if (kind === 'UnionTypeDeclaration') {
      return;
    }

    // Set default types if no type definition is present
    if (types === undefined) {
      if (declaration['properties']) {
        schema.type = 'object';
      } else {
        schema.type = 'string';
      }
      return;
    }

    let format = undefined;

    if (declaration['format']) {
      format = declaration['format']();
    }

    const { type, pattern } = this.guessTypeFromNameAndFormat(types, format);

    if (type === undefined) {
      schema.type = this.guessTypeFromKind(kind);
    } else {
      schema.type = type;
    }

    schema.pattern = pattern;
  }

  protected static guessTypeFromNameAndFormat(names: string[], format: string = undefined): any {
    const types = [];
    let pattern = undefined;

    for (const name of names) {
      switch (name) {
        case 'string':
        case 'boolean':
        case 'number':
        case 'integer':
        case 'array':
        case 'object':
          types.push(name);
          break;
        case 'date-only':
          types.push('string');
          pattern = constants.dateOnlyPattern;
          break;
        case 'time-only':
          types.push('string');
          pattern = constants.timeOnlyPattern;
          break;
        case 'datetime-only':
          types.push('string');
          pattern = constants.dateTimeOnlyPattern;
          break;
        case 'datetime':
          types.push('string');
          if (format === undefined || format.toLowerCase() === constants.RFC3339) {
            pattern = constants.RFC3339DatetimePattern;
          } else if (format.toLowerCase() === constants.RFC2616) {
            pattern = constants.RFC2616DatetimePattern;
          }
          break;
        case 'union':
          // @TODO Resolve union types
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
          types.push('object');
          break;
        case 'nil':
          types.push('null');
          break;
        case 'file':
          types.push('string');
          break;
      }
    }

    // Make sure we remove any duplicates
    let type;
    const unique = [...new Set(types)];
    if (unique.length === 0) {
      type = undefined;
    } else if (unique.length === 1) {
      type = unique[0];
    } else {
      type = unique;
    }

    return {
      type,
      pattern,
    };
  }

  protected static guessTypeFromKind(kind: string): string {
    switch (kind) {
      case 'ObjectTypeDeclaration':
        return 'object';
      case 'ArrayTypeDeclaration':
        return 'array';
      case 'StringTypeDeclaration':
      case 'DateTypeDeclaration':
      case 'FileTypeDeclaration':
      case 'DateOnlyTypeDeclaration':
      case 'TimeOnlyTypeDeclaration':
      case 'DateTimeOnlyTypeDeclaration':
        return 'string';
      case 'BooleanTypeDeclaration':
        return 'boolean';
      case 'NumberTypeDeclaration':
        return 'number';
      case 'IntegerTypeDeclaration':
        return 'integer';
    }
  }
}
