export interface ApiBlueprintSpec {
}

export interface Mson {
  type: string;
  default?: string;
  required?: boolean;
  values?: EnumValue[];
}

export interface EnumValue {
  value: string;
}
