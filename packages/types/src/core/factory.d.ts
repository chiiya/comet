import { CommandConfig, OpenApiSpec } from '..';

export interface Factory {
  execute(model: OpenApiSpec, config: CommandConfig): any;
}
