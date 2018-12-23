import { OpenApiSpec } from '..';

export interface Parser {
  execute(path: string): Promise<OpenApiSpec>;
}
