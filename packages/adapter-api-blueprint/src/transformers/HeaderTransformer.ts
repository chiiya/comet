import { ApiBlueprintHeader } from '../../types/blueprint';
import { Header, Schema } from '@comet-cli/types';
import { isNumber } from '@comet-cli/utils';

export default class HeaderTransformer {
  /**
   * Parse AST header definitions.
   * @param data
   */
  public static execute(data: ApiBlueprintHeader[]): Header[] {
    const headers: Header[] = [];
    for (const header of data) {
      headers.push({
        description: null,
        key: header.name,
        example: header.value,
        schema: this.inferSchemaFromPrimitive(header.value),
        deprecated: false,
        required: false,
      });
    }
    return headers;
  }

  /**
   * Infer a valid JSON schema from a primitive (string/number).
   * @param value
   */
  protected static inferSchemaFromPrimitive(value: any): Schema {
    return {
      type: isNumber(value) ? 'number' : 'string',
    };
  }
}
