import { ApiModel, Config, LoggerInterface } from '../';

export interface AdapterInterface {
  execute(path: string, config: Config, logger: LoggerInterface): Promise<ApiModel>;
  name(): string;
}
