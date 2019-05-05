export interface ApiBlueprintSpec {
  _version: string;
  ast: ApiBlueprintAst;
  error: {
    code: number;
    message: string;
    location: ApiBlueprintLocation[];
  };
  warnings: ApiBlueprintWarning[];
}

export interface ApiBlueprintAst {
  _version: string;
  metadata: ApiBlueprintMetadata[];
  name: string;
  description: string;
  element: 'category';
  resourceGroups: any[];
  content: ApiBlueprintResourceGroup[];
}

export interface ApiBlueprintResourceGroup {
  element: 'category';
  attributes?: ApiBlueprintResourceGroupAttributes;
  content: (ApiBlueprintResource | ApiBlueprintCopy)[];
}

export interface ApiBlueprintResource {
  element: 'resource';
  name: 'string';
  description: 'string';
  uriTemplate: 'string';
  model: ApiBlueprintResourceModel;
  parameters: ApiBlueprintParameter[];
  actions: ApiBlueprintAction[];
}

export interface ApiBlueprintCopy {
  element: 'copy';
  content: string;
}

export interface ApiBlueprintResourceModel {
  name: string;
  description: string;
  headers: ApiBlueprintHeader[];
  body: string;
  schema: string;
  content: ApiBlueprintAsset[];
}

export interface ApiBlueprintAction {
  name: string;
  description: string;
  method: string;
  parameters: ApiBlueprintParameter[];
  attributes: {
    relation: string;
    uriTemplate: string;
  };
  content: (ApiBlueprintAsset | ApiBlueprintDataStructure)[];
  examples: ApiBlueprintExample[];
}

export interface ApiBlueprintExample {
  name: string;
  description: string;
  requests: ApiBlueprintRequest[];
  responses: ApiBlueprintResponse[];
}

export interface ApiBlueprintRequest {
  name: string;
  description: string;
  reference?: ApiBlueprintReference;
  headers: ApiBlueprintHeader[];
  body: string;
  schema: string;
  content: (ApiBlueprintAsset | ApiBlueprintDataStructure)[];
}

export interface ApiBlueprintResponse {
  name: string;
  description: string;
  reference?: ApiBlueprintReference;
  headers: ApiBlueprintHeader[];
  body: string;
  schema: string;
  content: (ApiBlueprintAsset | ApiBlueprintDataStructure)[];

}

export interface ApiBlueprintReference {
  id: string;
}

export interface ApiBlueprintParameter {
  name: string;
  description: string;
  type: string;
  required: boolean;
  default: string;
  example: string;
  values: ApiBlueprintEnumValue[];
}

export interface ApiBlueprintEnumValue {
  value: string;
}

export interface ApiBlueprintAsset {
  element: 'asset';
  attributes: {
    role: string;
  };
  content: string;
}

export interface ApiBlueprintDataStructure {
  element: 'dataStructure';
  content: ApiBlueprintDataStructureEntity[];
}

export interface ApiBlueprintDataStructureEntity {
  element: string;
  meta?: {
    id?: string;
    description?: string;
  };
  attributes?: {
    typeAttributes?: string[];
  };
  content: (ApiBlueprintDataStructureEntity | ApiBlueprintDataStructureProperty)[];
}

export interface ApiBlueprintDataStructureProperty {
  element: string;
  meta?: {
    description?: string;
  };
  attributes?: {
    typeAttributes?: string[];
  };
  content: {
    key: {
      element: string;
      content: string;
    };
    value: {
      element: string;
      content: string;
    };
  };
}

export interface ApiBlueprintHeader {
  name: string;
  value: string;
}

export interface ApiBlueprintResourceGroupAttributes {
  name: string;
}

export interface ApiBlueprintMetadata {
  name: string;
  value: string;
}

export interface ApiBlueprintWarning {
  code: number;
  message: string;
  location: ApiBlueprintLocation[];
}

export interface ApiBlueprintLocation {
  index: number;
  length: number;
}
