import { ApiModel, CommandConfig, LoggerInterface } from '..';

export interface ParserInterface {
  execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel>;
}
