import {
  Bodies,
  Header,
  Omit,
  Operation,
  Resource,
  ResourceGroup,
  Response
} from '@comet-cli/types';

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
  requestHeaders: DocHeader[];
  responses?: DocResponses;
}

export interface DocResponses {
  [code: string]: DocResponse;
}

export interface DocResponse extends Omit<Response, 'headers'> {
  headers: DocHeader[];
}

export interface DocHeader extends Header {
  displayName: string | undefined;
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

export interface Navigation {
  items: NavGroup[];
  operations: NavOperation[];
}

export interface NavGroup {
  name: string;
  link: string;
  items: NavGroup[];
  operations: NavOperation[];
}

export interface NavOperation {
  name: string;
  link: string;
  method: string;
}

export interface ApiState {
  name: string;
  description: string;
  resources: Resources;
  resourceIds: string[];
  operations: Operations;
  groups: Groups;
  groupIds: string[];
  navigation: Navigation;
}
