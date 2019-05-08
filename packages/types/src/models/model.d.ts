export type Dict<T> = {
  [key: string]: T;
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface Schema {
  $schema?: string;
  $ref?: string;
  type?: string | string[];
  properties?: { [name: string]: Schema };
  additionalProperties?: boolean | Schema;
  description?: string;
  default?: any;
  items?: Schema;
  required?: string[];
  format?: string;
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
  discriminator?: string;
  xml?: XmlDeclaration;
}

export interface XmlDeclaration {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export interface ApiModel {
  info: Information;
  auth?: Dict<Authentication>;
  groups: ResourceGroup[];
  resources: Resource[];
  securedBy?: SecurityRequirement[];
  [key: string]: any; // For decoration
}

export interface SecurityRequirement {
  [name: string]: string[];
}

export interface Information {
  name: string;
  description?: string;
  version?: string;
  servers: Server[];
  [key: string]: any; // For decoration
}

export interface Server {
  uri: string;
  description?: string;
  variables?: Dict<Schema>;
  [key: string]: any; // For decoration
}

export interface Resource {
  path: string;
  name?: string;
  description?: string;
  parameters?: Parameter[];
  operations?: Operation[];
  [key: string]: any; // For decoration
}

export interface ResourceGroup {
  name: string;
  description?: string;
  resources: Resource[];
  [key: string]: any; // For decoration
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
  [key: string]: any; // For decoration
}

export type AuthType = 'basic' | 'digest' | 'jwt' | 'key' | 'oauth2';
export type ApiKeyLocation = 'header' | 'cookie' | 'query';
export type ParameterLocation = 'path' | 'query' | 'cookie';

export interface Operation {
  method: string;
  name?: string;
  description?: string;
  parameters: Parameter[];
  transactions?: Transaction[];
  deprecated?: boolean;
  securedBy?: SecurityRequirement[];
  tags?: string[];
  [key: string]: any; // For decoration
}

export interface Transaction {
  description?: string;
  request?: Request;
  responses?: Responses;
}

export interface Responses {
  [code: string]: Response;
}

export interface Request {
  description?: string;
  headers?: Header[];
  body?: Bodies;
  [key: string]: any; // For decoration
}

export interface Response {
  description?: string;
  statusCode: number | string;
  headers?: Header[];
  body?: Bodies;
  [key: string]: any; // For decoration
}

export interface Bodies {
  [mime: string]: Body;
}

export interface Body {
  schema?: Schema;
  mediaType?: string;
  examples?: any[];
  [key: string]: any; // For decoration
}

export interface Header {
  description?: string;
  key: string;
  schema?: Schema;
  example?: any;
  deprecated?: boolean;
  required: boolean;
  [key: string]: any; // For decoration
}

export interface Parameter {
  name: string;
  description?: string;
  required: boolean;
  location: ParameterLocation;
  schema: Schema;
  example?: any;
  deprecated?: boolean;
  [key: string]: any; // For decoration
}
