import { ApiModel, CommandConfig, LoggerInterface } from '..';

export interface PluginInterface {
  execute(model: ApiModel, config: CommandConfig, logger: LoggerInterface): Promise<any>;
}
