import { Omit, Operation, Resource, ResourceGroup } from '@comet-cli/types';

export interface EnhancedResource extends Omit<Resource, 'operations'> {
  operations: string[];
}

export interface EnhancedGroup extends Omit<ResourceGroup, 'resources'> {
  resources: string[];
}

export interface Resources {
  [id: string]: EnhancedResource;
}

export interface Groups {
  [id: string]: EnhancedGroup;
}

export interface Operations {
  [id: string]: Operation;
}

export interface ApiState {
  name: string;
  description: string;
  resources: Resources;
  operations: Operations;
  groups: Groups;
}
