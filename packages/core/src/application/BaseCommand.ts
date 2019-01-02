import { Command } from '@oclif/command';
import * as Config from '@oclif/config';
import ConfigRepository from '../config/ConfigRepository';
import Resolver from '../services/Resolver';
import { Decorator, Factory, OpenApiSpec, Parser } from '@comet-cli/types';
import Logger from '../helpers/Logger';
import File from '../helpers/File';

export default abstract class BaseCommand extends Command {
  /** Comet config repository */
  protected configRepository: ConfigRepository;

  /** Resolved parser instance */
  protected parser: Parser;

  /** Resolved decorator instances */
  protected decorators: Decorator[];

  /** Resolved factory instances */
  protected factories: Factory[];

  /** Logger instance */
  protected logger: Logger;

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
    this.logger = new Logger();
  }

  /**
   * Resolve parser, decorator and factory instances for a command.
   */
  protected async resolve() {
    if (this.signature == null) {
      return;
    }
    const resolver = new Resolver(this.configRepository, this.signature);
    this.parser = await resolver.resolveParser();
    this.decorators = await resolver.resolveDecorators();
    this.factories = await resolver.resolveFactories();
  }

  /**
   * Parse an api specification from a given file.
   */
  protected async parseSpec(file: File): Promise<OpenApiSpec> {
    // Parse input file
    this.logger.spin('Parsing input file');
    let spec;

    try {
      await this.resolve();
      spec = await this.parser.execute(file.path());
    } catch (error) {
      this.logger.fail(error.message);
      process.exit(-1);
    }

    this.logger.succeed('Input file parsed');
    return spec;
  }

  /**
   * Run all configured factories for this command.
   * @param specification
   */
  protected async runFactories(specification: OpenApiSpec) {
    try {
      for (let i = 0; i < this.factories.length; i = i + 1) {
        await this.factories[i].execute(specification);
      }
    } catch (error) {
      this.logger.fail(error.message);
      process.exit(-1);
    }
  }

  /**
   * Run all configured decorators for this command.
   * @param specification
   */
  protected async runDecorators(specification: OpenApiSpec) {
    try {
      for (let i = 0; i < this.decorators.length; i = i + 1) {
        await this.decorators[i].execute(specification);
      }
    } catch (error) {
      this.logger.fail(error.message);
      process.exit(-1);
    }
  }
}
