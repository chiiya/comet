import { OpenAPIParameterLocation } from '@comet-cli/types';
import { JsonSchema } from '@comet-cli/decorator-json-schemas/types/json-schema';

export interface TestSuite {
  name: string;
  url: string;
  testCases: TestCase[];
}

export interface TestCase {
  name: string;
  path: string;
  method: Method;
  parameters: Parameter[];
  hasRequestBody: boolean;
  requestBody: any;
  schema: string;
}

export type Method =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'options'
  | 'head'
  | 'trace';

export interface Parameter {
  name: string;
  value: any;
  location: OpenAPIParameterLocation;
  required: boolean;
}

export type ParametersObject = {
  required: Parameter[],
  optional: Parameter[],
  hasAllRequiredParameters: boolean,
  warnings: string[],
};

export type OperationObject = {
  testCases: TestCase[],
  warnings: string[],
};

export type FaultyValue = {
  value: any,
  fault: string,
};
