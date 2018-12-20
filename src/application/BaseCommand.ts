import { Command } from '@oclif/command';
import * as Config from '@oclif/config';
import ConfigRepository from '../config/ConfigRepository';

export default abstract class BaseCommand extends Command {
  /** Comet config repository */
  protected configRepository: ConfigRepository;

  constructor(argv: string[], config: Config.IConfig) {
    super(argv, config);
    this.configRepository = new ConfigRepository();
  }
}
