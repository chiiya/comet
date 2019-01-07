import {
  Omit,
  OpenAPISchema,
  OpenApiSpec,
} from '@comet-cli/types';

interface Decorated {
  jsonSchemas: Action[];
  [key: string] : any;
}

export interface Action {
  $path: string;
  $method: string;
  $operation: 'request' | 'response';
  schema: JsonSchema;
}

export interface JsonSchema extends Omit<OpenAPISchema,
  | 'type'
  | 'oneOf'
  | 'anyOf'
  | 'allOf'
  | 'not'
  | 'items'
  | 'additionalProperties'
  | 'properties'
  | 'nullable'
  | 'discriminator'
  | 'readOnly'
  | 'writeOnly'
  | 'externalDocs'
  | 'example'
  | 'deprecated' >{
  $schema: string;
  type?: string | string[];
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  not?: JsonSchema;
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  properties?: { [name: string]: JsonSchema };
}

export interface OpenApiSpecJsonDecorated extends OpenApiSpec {
  decorated: Decorated;
}
