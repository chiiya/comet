import { Schema } from '@comet-cli/types';
import { FaultyValue } from '../types';

export default class FaultyValueResolver {
  public static resolveFaultyValues(value: string, schema: Schema): FaultyValue[] {
    const faultyValues: FaultyValue[] = [];
    if (schema.properties[value]) {
      const subSchema = schema.properties[value];
      if (
        subSchema.type
        && (subSchema.type === 'integer' || subSchema.type === 'number' || subSchema.type === 'boolean')
      ) {
        faultyValues.push({
          value: this.generateRandomString(5),
          fault: 'DataType',
        });
      }
      if (subSchema.minLength)  {
        faultyValues.push({
          value: this.generateRandomString(subSchema.minLength - 1),
          fault: 'MinLength',
        });
      }
      if (subSchema.maxLength)  {
        faultyValues.push({
          value: this.generateRandomString(subSchema.maxLength + 1),
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

    return this.generateRandomString(length);
  }
}
