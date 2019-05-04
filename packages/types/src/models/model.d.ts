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

export interface ApiModel {
  info: Information;
  auth?: Authentication;
  groups: ResourceGroup[];
  resources: Resource[];
}

export interface Information {
  name: string;
  description?: string;
  host: string;
  version?: string;
}

export interface Resource {
  path: string;
  name?: string;
  description?: string;
  parameters?: Parameter[];
  operations?: Operation[];
}

export interface ResourceGroup {
  name: string;
  description?: string;
  resources: Resource[];
}

export interface Authentication {
  type?: AuthType;
  name?: string;
  location?: ApiKeyLocation;
}

export type AuthType = 'basic' | 'digest' | 'jwt' | 'key' | 'oauth2';
export type ApiKeyLocation = 'header' | 'cookie' | 'query';
export type ParameterLocation = 'path' | 'query' | 'cookie';

export interface Operation {
  method: string;
  name?: string;
  description?: string;
  parameters: Parameter[];
  request?: Request;
  responses?: Response[];
  deprecated?: boolean;
}

export interface Request {
  description?: string;
  mediaType?: string;
  schema?: JsonSchema;
  headers?: Header[];
  example?: string;
}

export interface Response {
  description?: string;
  mediaType?: string;
  statusCode?: number;
  schema?: JsonSchema;
  headers?: Header[];
  example?: string;
}

export interface Header {
  description?: string;
  key: string;
  schema?: JsonSchema;
  example?: any;
  deprecated?: boolean;
}

export interface Parameter {
  name: string;
  description?: string;
  required: boolean;
  location: ParameterLocation;
  schema: JsonSchema;
  example?: any;
  deprecated?: boolean;
}
