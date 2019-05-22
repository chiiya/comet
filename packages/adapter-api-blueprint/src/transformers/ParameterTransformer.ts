import { ApiBlueprintParameter } from '../../types/blueprint';
import { Schema, Parameter, ParameterLocation } from '@comet-cli/types';
import ParsingException from '../ParsingException';
import { isNumber } from '@comet-cli/helper-utils';

export default class ParameterTransformer {
  /**
   * Parse parameters from the AST.
   * @param uri
   * @param params
   */
  public static execute(uri: string, params: ApiBlueprintParameter[]): Parameter[] {
    const parameters: Parameter[] = [];
    for (const param of params) {
      // First, test whether the parameter is actually defined in the URI
      const inUri = new RegExp(`{.*${param.name}.*}`);
      if (inUri.test(uri) === false) {
        continue;
      }
      const isQueryParam = new RegExp(`{[?&#+].*${param.name}`);
      let location: ParameterLocation;
      let defaultRequired;
      if (isQueryParam.test(uri) === true) {
        location = 'query';
        defaultRequired = false;
      } else {
        location = 'path';
        defaultRequired = true;
      }
      parameters.push({
        location,
        name: decodeURI(param.name),
        description: param.description.trim(),
        required: param.required || defaultRequired,
        example: param.example || null,
        deprecated: false,
        schema: this.transformToJsonSchema(param),
      });
    }
    return parameters;
  }

  /**
   * Transform an MSON parameter type definition to a valid JSON schema definition.
   * @param data
   */
  protected static transformToJsonSchema(data: ApiBlueprintParameter): Schema {
    const isNestedArrayType = this.isNestedArrayType(data.type);

    if (this.isValidType(data.type) === false && isNestedArrayType === false) {
      throw new ParsingException(`Invalid type definition: ${data.type}`);
    }

    const schema: Schema = {
      type: data.type,
    };

    if (data.default) {
      schema.default = data.default;
    }

    // If it's an enum (values array present), adjust the schema
    if (data.values && data.values.length > 0) {
      const values = data.values ? data.values.map(item => item.value) : [];
      schema.type = data.type;
      schema.enum = values;
    }

    // If it's a nested array type definition (e.g. array[string]), adjust the schema
    if (isNestedArrayType) {
      schema.type = 'array';
      const nestedTypes = /array\[(\w+)(?:,\s*(\w+))*]/g.exec(data.type);
      if (nestedTypes !== null) {
        nestedTypes.shift();
        // Only one item
        if (nestedTypes.length === 1 && this.isValidType(nestedTypes[0])) {
          schema.items = {
            type: nestedTypes[0],
          };
        } else {
          schema.type = undefined;
          schema.anyOf = [];
          for (const subType of nestedTypes) {
            if (this.isValidType(subType)) {
              schema.anyOf.push({
                type: subType,
              });
            }
          }
        }
      }
    }

    return schema;
  }

  /**
   * Check whether an MSON type definition is a valid type.
   * @param type
   */
  protected static isValidType(type: string): boolean {
    return ['null', 'boolean', 'object', 'array', 'number', 'integer', 'string'].includes(type);
  }

  /**
   * Check whether an MSON type definition is a nested array, e.g. `array[string]`
   * @param type
   */
  protected static isNestedArrayType(type: string): boolean {
    return /array\[\w+]/g.test(type);
  }
}
