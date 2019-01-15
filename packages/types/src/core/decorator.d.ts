import { CommandConfig, OpenApiSpec } from '..';

export interface Decorator {
  execute(model: OpenApiSpec, config: CommandConfig): Promise<string[]>;
  getName(): string;
}
