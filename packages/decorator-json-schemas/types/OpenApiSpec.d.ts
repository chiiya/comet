import { Omit, OpenAPISchema, OpenApiSpec } from '@comet-cli/types';

interface Decorated {
  jsonSchemas: JsonSchema[];
  [key: string] : any;
}

interface JsonSchema extends Omit<OpenAPISchema,
  | 'type'
  | 'oneOf'
  | 'anyOf'
  | 'allOf'
  | 'not'
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
  properties?: { [name: string]: JsonSchema };
  $path: string;
  $method: string;
  $operation: 'request' | 'response';
}

export interface OpenApiSpecJsonDecorated extends OpenApiSpec {
  decorated: Decorated;
}
