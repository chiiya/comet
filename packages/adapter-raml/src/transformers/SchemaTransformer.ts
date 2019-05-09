import {
  ArrayTypeDeclaration,
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
    schema.type = this.transformType(schema, declaration);
    this.transformFacets(schema, declaration);
    this.transformCommonProperties(schema, declaration);
    switch (declaration.kind()) {
      case 'ArrayTypeDeclaration':
        this.transformArrayProperties(spec, schema, <ArrayTypeDeclaration>declaration);
        break;
      case 'ObjectTypeDeclaration':
        this.transformObjectProperties(spec, schema, <ObjectTypeDeclaration>declaration);
        break;
    }
    return schema;
  }

  public static getFacets(declaration: ITypeDefinition): any {
    if (declaration.superTypes().length === 0) {
      return declaration.fixedBuiltInFacets();
    }
    return { ...this.getFacets(declaration.superTypes()[0]), ...declaration.fixedBuiltInFacets() };
  }

  protected static transformCommonProperties(schema: Schema, declaration: TypeDeclaration): void {
    schema.title = declaration.displayName() || undefined;
    // schema.default = declaration.default() || undefined;
    // schema.description = declaration.description() ? declaration.description().value() : undefined;
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
    }
    if (structuredItems !== null) {
      console.log(`Scalar: ${structuredItems.isScalar()} | Array: ${structuredItems.isArray()}`);
      // Simple type definition (just the type)
      if (structuredItems.isScalar() && structuredItems.value()) {
        schema.items = { type: structuredItems.value() };
      }
      if (structuredItems.properties() && structuredItems.properties().length > 0) {
        for (const item of structuredItems.properties()) {
          console.log(item.name(), item.value().value());
        }
      }
    }
    /**
     * Inlined component type definition
     **/
    // structuredItems(): TypeInstance;
    /**
     * Anonymous type declaration defined by "items" keyword.
     * If no "items" is defined explicitly, this one is null.
     **/
    // items(): string[];
    /**
     * Returns anonymous type defined by "items" keyword, or a component type if declaration can be found.
     * Does not resolve type expressions. Only returns component type declaration if it is actually defined
     * somewhere in AST.
     **/
    // findComponentTypeDeclaration(): TypeDeclaration;
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
      if (key === 'displayName') {
        schema.title = <string>value;
      }
    }
  }

  protected static transformType(schema: Schema, declaration: TypeDeclaration): string | string[] {
    const type = declaration.type();
    const kind = declaration.kind();

    // @TODO: Deal with this
    if (kind === 'UnionTypeDeclaration') {
      return undefined;
    }

    // Set default types if no type definition is present
    if (type === undefined) {
      if (declaration['properties']) {
        return 'object';
      }
      return 'string';
    }

    let format = undefined;

    if (declaration['format']) {
      format = declaration['format']();
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
          // We are dealing with a user-defined type, determine super-type
          // Sets user-defined type names to 'object' (if their super-type is object)
          transformed.push(this.guessTypeFromKind(kind));
      }
    }
    // Apply the transformed types to the schema.
    const unique = [...new Set(transformed)];
    if (unique.length === 0) {
      return undefined;
    }
    if (unique.length === 1) {
      return unique[0];
    }
    return unique;
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
