import { OpenApiSpec } from '..';

export interface Factory {
  execute(model: OpenApiSpec): any;
}
