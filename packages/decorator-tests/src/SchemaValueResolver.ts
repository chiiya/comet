import { OpenAPISchema } from '@comet-cli/types';
import UnresolvableParameterError from './UnresolvableParameterError';
import { FaultyValue } from '../types/tests';

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

  public static resolveFaultyValues(value: string, schema: OpenAPISchema): FaultyValue[] {
    const faultyValues: FaultyValue[] = [];
    if (schema.properties[value]) {
      const subSchema = schema.properties[value];
      if (
        subSchema.type
        && (subSchema.type === 'integer' || subSchema.type === 'number' || subSchema.type === 'boolean')
      ) {
        faultyValues.push({
          value: SchemaValueResolver.generateRandomString(5),
          fault: 'DataType',
        });
      }
      if (subSchema.minLength)  {
        faultyValues.push({
          value: SchemaValueResolver.generateRandomString(subSchema.minLength - 1),
          fault: 'MinLength',
        });
      }
      if (subSchema.maxLength)  {
        faultyValues.push({
          value: SchemaValueResolver.generateRandomString(subSchema.maxLength + 1),
          fault: 'MaxLength',
        });
      }
    }
    return faultyValues;
  }

  /**
   * Generate a random string not containing any numbers and equal to 'true' or 'false'
   *
   * @param length
   *
   * @returns string
   */
  protected static generateRandomString(length: number): string {
    let string: string = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < length; i += 1) {
      string += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    if (string !== 'true' && string !== 'false') {
      return string;
    }

    return SchemaValueResolver.generateRandomString(length);
  }
}
