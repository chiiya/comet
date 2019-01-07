import { CommandConfig, OpenApiSpec } from '..';

export interface Decorator {
  execute(model: OpenApiSpec, config: CommandConfig): any;
}
