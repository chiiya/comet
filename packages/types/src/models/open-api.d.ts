/**
 * Type definitions for the OpenAPI specification
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
 * Taken with some modifications from https://github.com/Rebilly/ReDoc, license:

 The MIT License (MIT)

 Copyright (c) 2015-present, Rebilly, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import { Omit } from './model';

// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// declare global {
//   type Dict<T> = {
//     [key: string]: T;
//   };
// }

export interface OpenApiSpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: OpenAPIPaths;
  components?: OpenAPIComponents;
  security?: OpenAPISecurityRequirement[];
  tags?: OpenAPITag[];
  externalDocs?: OpenAPIExternalDocumentation;
  decorated: any;
  [key: string] : any; // For decoration
}

export interface OpenAPIInfo {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenAPIContact;
  license?: OpenAPILicense;
  version: string;
  [key: string] : any; // For decoration
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: { [name: string]: OpenAPIServerVariable };
  [key: string] : any; // For decoration
}

export interface OpenAPIServerVariable {
  enum?: string[];
  default: string;
  description?: string;
  [key: string] : any; // For decoration
}

export interface OpenAPIPaths {
  [path: string]: OpenAPIPath;
}

export interface OpenAPIPath {
  summary?: string;
  description?: string;
  get?: OpenAPIOperation;
  put?: OpenAPIOperation;
  post?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  trace?: OpenAPIOperation;
  servers?: OpenAPIServer[];
  parameters?: OpenAPIParameter[];
  [key: string] : any; // For decoration
}

export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocumentation;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: OpenAPIResponses;
  callbacks?: { [name: string]: OpenAPICallback };
  deprecated?: boolean;
  security?: OpenAPISecurityRequirement[];
  servers?: OpenAPIServer[];
  [key: string] : any; // For decoration
}

export interface OpenAPIParameter {
  name: string;
  in?: OpenAPIParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: OpenAPIParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: OpenAPISchema;
  example?: any;
  examples?: { [media: string]: OpenAPIExample };
  content?: { [media: string]: OpenAPIMediaType };
  [key: string] : any; // For decoration
}

export interface OpenAPIExample {
  value: any;
  summary?: string;
  description?: string;
  externalValue?: string;
  [key: string] : any; // For decoration
}

export interface OpenAPISchema {
  $ref?: string;
  type?: string;
  properties?: { [name: string]: OpenAPISchema };
  additionalProperties?: boolean | OpenAPISchema;
  description?: string;
  default?: any;
  items?: OpenAPISchema;
  required?: string[];
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  format?: string;
  externalDocs?: OpenAPIExternalDocumentation;
  discriminator?: OpenAPIDiscriminator;
  nullable?: boolean;
  oneOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
  allOf?: OpenAPISchema[];
  not?: OpenAPISchema;

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
  [key: string] : any; // For decoration
}

export interface OpenAPIDiscriminator {
  propertyName: string;
  mapping?: { [name: string]: string };
  [key: string] : any; // For decoration
}

export interface OpenAPIMediaType {
  schema?: OpenAPISchema;
  example?: any;
  examples?: { [name: string]: OpenAPIExample };
  encoding?: { [field: string]: OpenAPIEncoding };
  [key: string] : any; // For decoration
}

export interface OpenAPIEncoding {
  contentType: string;
  headers?: { [name: string]: OpenAPIHeader };
  style: OpenAPIParameterStyle;
  explode: boolean;
  allowReserved: boolean;
  [key: string] : any; // For decoration
}

export type OpenAPIParameterLocation = 'query' | 'header' | 'path' | 'cookie';
export type OpenAPIParameterStyle =
  | 'matrix'
  | 'label'
  | 'form'
  | 'simple'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject';

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: OpenAPIMediaTypes;
  [key: string] : any; // For decoration
}

export interface OpenAPIMediaTypes {
  [mime: string]: OpenAPIMediaType;
}

export interface OpenAPIResponses {
  [code: string]: OpenAPIResponse;
}

export interface OpenAPIResponse {
  description?: string;
  headers?: { [name: string]: OpenAPIHeader };
  content?: OpenAPIMediaTypes;
  links?: { [name: string]: OpenAPILink };
  [key: string] : any; // For decoration
}

export interface OpenAPILink {
  $ref?: string;
  [key: string] : any; // For decoration
}

export type OpenAPIHeader = Omit<OpenAPIParameter, 'in' | 'name'>;

export interface OpenAPICallback {
  $ref?: string;
  [key: string] : any; // For decoration
}

export interface OpenAPIComponents {
  schemas?: { [name: string]: OpenAPISchema };
  responses?: { [name: string]: OpenAPIResponse };
  parameters?: { [name: string]: OpenAPIParameter };
  examples?: { [name: string]: OpenAPIExample };
  requestBodies?: { [name: string]: OpenAPIRequestBody };
  headers?: { [name: string]: OpenAPIHeader };
  securitySchemes?: { [name: string]: OpenAPISecurityScheme };
  links?: { [name: string]: OpenAPILink };
  callbacks?: { [name: string]: OpenAPICallback };
  [key: string] : any; // For decoration
}

export interface OpenAPISecurityRequirement {
  [name: string]: string[];
}

export interface OpenAPISecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat: string;
  flows: {
    implicit?: {
      refreshUrl?: string;
      // scopes: Dict<string>;
      authorizationUrl: string;
    };
    password?: {
      refreshUrl?: string;
      // scopes: Dict<string>;
      tokenUrl: string;
    };
    clientCredentials?: {
      refreshUrl?: string;
      // scopes: Dict<string>;
      tokenUrl: string;
    };
    authorizationCode?: {
      refreshUrl?: string;
      authorizationUrl: string;
      // scopes: Dict<string>;
      tokenUrl: string;
    };
  };
  openIdConnectUrl?: string;
  [key: string] : any; // For decoration
}

export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocumentation;
  [key: string] : any; // For decoration
}

export interface OpenAPIExternalDocumentation {
  description?: string;
  url: string;
  [key: string] : any; // For decoration
}

export interface OpenAPIContact {
  name?: string;
  url?: string;
  email?: string;
  [key: string] : any; // For decoration
}

export interface OpenAPILicense {
  name: string;
  url?: string;
  [key: string] : any; // For decoration
}
