import { Parameter } from '@comet-cli/types';

export interface TestSuite {
  name: string;
  url: string;
  testCases: TestCase[];
}

export interface TestCase {
  name?: string;
  path: string;
  method: string;
  parameters: Parameter[];
  hasRequestBody: boolean;
  requestBody: string;
  schema: string;
  isFaulty: boolean;
}

export type Parameters = {
  required: Parameter[],
  optional: Parameter[],
};

export type FaultyValue = {
  value: any,
  fault: string,
};
