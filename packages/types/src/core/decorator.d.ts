import { OpenApiSpec } from '..';

export interface Decorator {
  execute(model: OpenApiSpec): void;
}
