import { OpenAPISchema } from '../../types/open-api';

export default class SchemaValueResolver {
  /**
   *
   * @param schema
   * @throws UnresolvableParameterError
   */
  public static execute(schema: OpenAPISchema): any  {
    let value;

    // Resolve a primitive data type value.
    value = this.resolveExampleValue(schema);
    if (value !== undefined) {
      return value;
    }

    value = this.resolveDefaultValue(schema);
    if (value !== undefined) {
      return value;
    }

    value = this.resolveEnumValue(schema);
    if (value !== undefined) {
      return value;
    }

    // If of type boolean, return true
    if (schema.type && schema.type === 'boolean') {
      return true;
    }

    // Resolve object data type
    if (schema.type && schema.type === 'object') {
      return this.resolveObjectValue(schema);
    }

    // Resolve array data type
    if (schema.type && schema.type === 'array' && schema.items && schema.items.type === 'object') {
      return [this.resolveObjectValue(schema.items)];
    }

    return undefined;
  }

  public static resolveObjectValue(schema: OpenAPISchema): any {
    if (schema.properties === undefined) {
      return undefined;
    }
    const value = {};
    for (const name of Object.keys(schema.properties)) {
      const result = this.execute(schema.properties[name]);
      if (result !== undefined) {
        value[name] = result;
      }
    }
    return value;
  }

  public static resolveExampleValue(schema: OpenAPISchema): any {
    if (schema.hasOwnProperty('example')) {
      return schema.example;
    }
    return undefined;
  }

  public static resolveDefaultValue(schema: OpenAPISchema): any {
    if (schema.hasOwnProperty('default')) {
      return schema.default;
    }

    if (schema.items && schema.items.hasOwnProperty('default')) {
      return [schema.items.default];
    }
    return undefined;
  }

  public static resolveEnumValue(schema: OpenAPISchema): any {
    if (schema.enum) {
      return schema.enum[Math.floor(Math.random() * schema.enum.length)];
    }

    if (schema.items && schema.items.enum) {
      return [schema.items.enum[Math.floor(Math.random() * schema.items.enum.length)]];
    }
    return undefined;
  }
}
