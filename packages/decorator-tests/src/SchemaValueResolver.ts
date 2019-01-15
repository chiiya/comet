import { OpenAPISchema } from '@comet-cli/types';
import UnresolvableParameterError from './UnresolvableParameterError';

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

    // Resolve object data type
    if (schema.type && schema.type === 'object') {
      return this.resolveObjectValue(schema);
    }

    // Resolve array data type
    if (schema.type && schema.type === 'array' && schema.items.type === 'object') {
      return [this.resolveObjectValue(schema.items)];
    }

    return undefined;
  }

  public static resolveObjectValue(schema: OpenAPISchema): any {
    const required = schema.required;
    const value = {};
    Object.keys(schema.properties).forEach((property: string) => {
      const result = this.execute(schema.properties[property]);
      if (result !== undefined) {
        value[property] = result;
      } else {
        if (required && required.includes(property) === true) {
          throw new UnresolvableParameterError(
            `Could not infer a value for required attribute ${property}`,
            property,
          );
        }
      }
    });
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
      return schema.enum[0];
    }

    if (schema.items && schema.items.enum) {
      return [schema.items.enum[0]];
    }
    return undefined;
  }
}
