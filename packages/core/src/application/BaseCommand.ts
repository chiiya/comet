import { Command } from '@oclif/command';
import * as Config from '@oclif/config';
import ConfigRepository from '../config/ConfigRepository';
import Resolver from '../services/Resolver';
import {
  ApiModel,
  CommandConfig,
  Decorator,
  Factory,
  OpenApiSpec,
  AdapterInterface,
} from '@comet-cli/types';
import { identify } from '@comet-cli/identify';
import Logger from '../helpers/Logger';
import File from '../helpers/File';
import { readFile } from 'fs-extra';
const chalk = require('chalk');

export default abstract class BaseCommand extends Command {
  /** Comet config repository */
  protected configRepository: ConfigRepository;

  /** Resolved adapter instance */
  protected adapter: AdapterInterface;

  /** Resolved decorator instances */
  protected decorators: Decorator[];

  /** Resolved factory instances */
  protected factories: Factory[];

  /** Logger instance */
  protected logger: Logger;

  /** Command signature, e.g. `make:tests` */
  protected signature: string | undefined;

  /** Command config key, e.g. `make.schemas` */
  protected configKey: string | undefined;

  /** Warnings from executed decorators and factories */
  protected warnings: string[] = [];

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
   * Resolve adapter, decorator and factory instances for a command.
   */
  protected async resolve(file: File) {
    if (this.signature == null) {
      return;
    }
    const resolver = new Resolver(this.configRepository, this.signature);
    const source = await readFile(file.path(), 'utf8');
    const mediaType = identify(source);
    let detected = null;
    switch (mediaType) {
      case 'text/vnd.apiblueprint':
        detected = '@comet-cli/adapter-api-blueprint';
        break;
      case 'application/vnd.oai.openapi':
      case 'application/vnd.oai.openapi+json':
      case 'application/swagger+yaml':
      case 'application/swagger+json':
        detected = '@comet-cli/adapter-openapi';
        break;
      case 'application/raml+yaml':
        detected = '@comet-cli/adapter-raml';
    }
    this.adapter = await resolver.resolveAdapter(detected);
    this.decorators = await resolver.resolveDecorators();
    this.factories = await resolver.resolveFactories();
  }

  /**
   * Load and parse specified input file.
   * @param args
   */
  protected async loadFile(args: { input: string; }): Promise<File> {
    let file;
    try {
      file = new File(args.input);
    } catch (error) {
      this.logger.fail(`${args.input} is not a valid file.\n${error.message}`);
      this.exit(-1);
    }
    return file;
  }

  /**
   * Parse an api specification from a given file.
   */
  protected async parseSpec(file: File): Promise<ApiModel> {
    // Parse input file
    this.logger.spin('Parsing input file');
    let spec;

    try {
      await this.resolve(file);
      spec = await this.adapter.execute(
        file.path(),
        this.configRepository.get(`commands.${this.configKey}`) as CommandConfig,
        this.logger,
      );
    } catch (error) {
      this.logger.fail(error.message);
      console.error(error.stack);
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
        let warnings = await this.factories[i].execute(
          specification,
          this.configRepository.get(`commands.${this.configKey}`) as CommandConfig,
        );
        warnings = warnings.map((warning: string) => {
          return `${chalk.italic.cyan(this.factories[i].getName())} - ${warning}`;
        });
        this.warnings.push(...warnings);
      }
    } catch (error) {
      this.logger.fail(error.message);
      this.exit(-1);
    }
  }

  /**
   * Run all configured decorators for this command.
   * @param specification
   */
  protected async runDecorators(specification: OpenApiSpec) {
    try {
      for (let i = 0; i < this.decorators.length; i = i + 1) {
        let warnings = await this.decorators[i].execute(
          specification,
          this.configRepository.get(`commands.${this.configKey}`) as CommandConfig,
        );
        warnings = warnings.map((warning: string) => {
          return `${chalk.italic.cyan(this.decorators[i].getName())} - ${warning}`;
        });
        this.warnings.push(...warnings);
      }
    } catch (error) {
      this.logger.fail(`${error.message}
      Stack: ${error.stack}`);
      this.exit(-1);
    }
  }

  /**
   * Print all warnings from decorators and factories.
   */
  protected printWarnings() {
    this.warnings.forEach((warning: string) => {
      this.logger.warn(warning);
    });
  }
}
