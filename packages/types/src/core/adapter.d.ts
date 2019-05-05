import { ApiModel, CommandConfig, LoggerInterface } from '..';

export interface AdapterInterface {
  execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel>;
}
