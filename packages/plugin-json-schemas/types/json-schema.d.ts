export interface Action {
  path: string;
  method: string;
  operation: 'request' | 'response';
  name: string;
  schema: JsonSchema;
}

export interface JsonSchema {
  $schema: string;
  $ref?: string;
  type?: string | string[];
  properties?: { [name: string]: JsonSchema };
  additionalProperties?: boolean | JsonSchema;
  description?: string;
  default?: any;
  items?: JsonSchema;
  required?: string[];
  format?: string;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  not?: JsonSchema;
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  enum?: any[];
}
