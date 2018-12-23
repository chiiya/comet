import { OpenAPIDiscriminator, OpenAPIExternalDocumentation } from '@comet-cli/types';

export interface Schema {
  $ref?: string;
  type?: string | string[];
  properties?: { [name: string]: Schema };
  additionalProperties?: boolean | Schema;
  description?: string;
  default?: any;
  items?: Schema;
  required?: string[];
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  format?: string;
  externalDocs?: OpenAPIExternalDocumentation;
  discriminator?: OpenAPIDiscriminator;
  nullable?: boolean;
  oneOf?: Schema[];
  anyOf?: Schema[];
  allOf?: Schema[];
  not?: Schema;

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
  example?: any;
}

export interface SchemaExport {
  [path: string]: Schema;
}
