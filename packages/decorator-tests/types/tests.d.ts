export interface TestSuite {
  name: string;
  url: string;
  operations: Operation[];
}

export interface Operation {
  name: string;
  path: string;
  method: Method;
  parameters: Parameter[];
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
  location: 'query' | 'header';
}
