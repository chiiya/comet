export type Dict<T> = {
  [key: string]: T;
};

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
  auth?: Dict<Authentication>;
  groups: ResourceGroup[];
  resources: Resource[];
  securedBy?: Dict<string[]>;
  [key: string] : any; // For decoration
}

export interface Information {
  name: string;
  description?: string;
  host: string;
  version?: string;
  [key: string] : any; // For decoration
}

export interface Resource {
  path: string;
  name?: string;
  description?: string;
  parameters?: Parameter[];
  operations?: Operation[];
  [key: string] : any; // For decoration
}

export interface ResourceGroup {
  name: string;
  description?: string;
  resources: Resource[];
  [key: string] : any; // For decoration
}

export interface Authentication {
  type?: AuthType;
  description?: string;
  name?: string;
  location?: ApiKeyLocation;
  flows?: {
    implicit?: {
      refreshUri?: string;
      scopes: Dict<string>;
      authorizationUri: string;
    };
    password?: {
      refreshUri?: string;
      scopes: Dict<string>;
      tokenUri: string;
    };
    clientCredentials?: {
      refreshUri?: string;
      scopes: Dict<string>;
      tokenUri: string;
    };
    authorizationCode?: {
      refreshUri?: string;
      authorizationUri: string;
      scopes: Dict<string>;
      tokenUri: string;
    };
  };
  [key: string] : any; // For decoration
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
  securedBy?: Dict<string[]>;
  [key: string] : any; // For decoration
}

export interface Request {
  description?: string;
  mediaType?: string;
  schema?: JsonSchema;
  headers?: Header[];
  example?: string;
  [key: string] : any; // For decoration
}

export interface Response {
  description?: string;
  mediaType?: string;
  statusCode?: number;
  schema?: JsonSchema;
  headers?: Header[];
  example?: string;
  [key: string] : any; // For decoration
}

export interface Header {
  description?: string;
  key: string;
  schema?: JsonSchema;
  example?: any;
  deprecated?: boolean;
  [key: string] : any; // For decoration
}

export interface Parameter {
  name: string;
  description?: string;
  required: boolean;
  location: ParameterLocation;
  schema: JsonSchema;
  example?: any;
  deprecated?: boolean;
  [key: string] : any; // For decoration
}
