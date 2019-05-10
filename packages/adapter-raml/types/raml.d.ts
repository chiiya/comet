export interface CanonicalType {
  name?: string;
  displayName?: string;
  typePropertyKind?: string;
  type?: string;
  required?: boolean;
  default?: any;
  description?: string;
  discriminator?: string;
  discriminatorValue?: any;
  properties?: { [name: string]: CanonicalType };
  items?: CanonicalType;
  anyOf?: CanonicalType[];
  allOf?: CanonicalType[];

  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  additionalProperties?: boolean;
  enum?: any[];
  example?: any;
  xml?: XmlDeclaration;
}

export interface XmlDeclaration {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}
