import { Omit, Operation, Resource, ResourceGroup } from '@comet-cli/types';

export interface DocResource extends Omit<Resource, 'operations' | 'parameters'> {
  id: string;
  link: string;
  operations: string[];
}

export interface DocGroup extends Omit<ResourceGroup, 'resources'> {
  link: string;
  resources: string[];
}

export interface Example {
  lang: string;
  example: string | any;
}

export interface DocOperation extends Omit<Operation, 'transactions'> {
  snippet: string;
  link: string;
  exampleRequest?: Example;
  exampleResponse?: Example;
}

export interface Resources {
  [id: string]: DocResource;
}

export interface Groups {
  [id: string]: DocGroup;
}

export interface Operations {
  [id: string]: DocOperation;
}

export interface ApiState {
  name: string;
  description: string;
  resources: Resources;
  resourceIds: string[];
  operations: Operations;
  groups: Groups;
  groupIds: string[];
}
