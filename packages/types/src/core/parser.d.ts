import { OpenApiSpec } from '..';

export interface Parser {
  execute(path: string): OpenApiSpec;
}
