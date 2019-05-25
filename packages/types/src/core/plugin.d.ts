import { ApiModel, Config, LoggerInterface } from '../index';

export interface PluginInterface {
  execute(model: ApiModel, config: Config, logger: LoggerInterface): Promise<any>;
  name(): string;
}
