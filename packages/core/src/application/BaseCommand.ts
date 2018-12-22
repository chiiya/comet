import { Command } from '@oclif/command';
import * as Config from '@oclif/config';
import ConfigRepository from '../config/ConfigRepository';
import Resolver from '../services/Resolver';
import { Parser } from '@comet-cli/types';

export default abstract class BaseCommand extends Command {
  /** Comet config repository */
  protected configRepository: ConfigRepository;

  /** Resolved parser instance */
  protected parser: Parser;

  /** Command signature, e.g. `make:tests` */
  protected signature: string | undefined;

  /**
   * BaseCommand constructor.
   * @param argv
   * @param config
   */
  constructor(argv: string[], config: Config.IConfig) {
    super(argv, config);
    this.configRepository = new ConfigRepository();
  }

  /**
   * Resolve parser, decorator and factory instances for a command.
   */
  protected async resolve() {
    if (this.signature === undefined) {
      return;
    }
    const resolver = new Resolver(this.configRepository, this.signature);
    this.parser = await resolver.resolveParser();
  }
}
