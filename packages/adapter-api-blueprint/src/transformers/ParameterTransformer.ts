import { ApiBlueprintParameter } from '../../types/blueprint';
import { JsonSchema, Parameter } from '@comet-cli/types';
import ParsingException from '../ParsingException';

export default class ParameterTransformer {
  /**
   * Parse parameters from the AST.
   * @param uri
   * @param params
   */
  public static execute(uri: string, params: ApiBlueprintParameter[]): Parameter[] {
    const parameters: Parameter[] = [];
    for (const param of params) {
      const isQueryParam = new RegExp(`{[?&#+].*${param.name}`);
      let location;
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
  protected static transformToJsonSchema(data: ApiBlueprintParameter): JsonSchema {
    const isNestedArrayType = this.isNestedArrayType(data.type);

    if (this.isValidType(data.type) === false && isNestedArrayType === false) {
      throw new ParsingException(`Invalid type definition: ${data.type}`);
    }

    const schema: JsonSchema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: data.type,
    };

    if (data.default) {
      schema.default = data.default;
    }

    // If it's an enum (values array present), adjust the schema
    if (data.values && data.values.length > 0) {
      const values = data.values ? data.values.map(item => item.value) : [];
      schema.type = 'array';
      schema.items = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        type: data.type,
        enum: values,
      };
    }

    // If it's a nested array type definition (e.g. array[string]), adjust the schema
    if (isNestedArrayType) {
      const nestedType = /array\[(\w+)]/g.exec(data.type)[1];
      schema.type = 'array';
      if (this.isValidType(nestedType)) {
        schema.items = {
          $schema: 'http://json-schema.org/draft-04/schema#',
          type: nestedType,
        };
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
