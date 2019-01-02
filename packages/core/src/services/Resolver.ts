import ConfigRepository from '../config/ConfigRepository';
import { Decorator, Factory, Parser } from '@comet-cli/types';

export default class Resolver {
  /** Comet config repository */
  protected config: ConfigRepository;

  /** Command signature with dot notation (make.tests) */
  protected signature: string;

  /** Command signature */
  protected command: string;

  /**
   * Resolver constructor.
   * @param config
   * @param signature
   */
  constructor(config: ConfigRepository, signature: string) {
    this.config = config;
    this.signature = signature.replace(':', '.');
    this.command = signature;
  }

  /**
   * Resolve the configured parser for a command and return an instance of it.
   */
  public async resolveParser(): Promise<Parser> {
    // Fetch configured parser from config
    const configuredParser = this.config.get(`commands.${this.signature}.parser`);
    if (configuredParser == null) {
      throw new Error(`ConfigError:
      No parser configuration could be found for \`${this.command}\`.
      Please check your configuration file, and make sure that a value has been
      defined for \`${this.signature}.parser\`
      `);
    }

    // Try to import the configured parser
    let parserClass;
    try {
      parserClass = await import(String(configuredParser));
      parserClass = parserClass.default;
    } catch (error) {
      error.message =
        `Could not find module \`${configuredParser}\`. Run \`npm install ${configuredParser}\` to install`;
      throw error;
    }

    return new parserClass();
  }

  /**
   * Resolve the configured decorators for a command and return an instance of each.
   */
  public async resolveDecorators(): Promise<Decorator[]> {
    // Fetch configured decorators from config
    const configuredDecorators = this.config.get(`commands.${this.signature}.decorators`);
    if (configuredDecorators == null) {
      throw new Error(`ConfigError:
      No resolvable decorator configuration could be found for \`${this.command}\`.
      Please check your configuration file, and make sure that a value has been
      defined for \`${this.signature}.decorators\`
      `);
    }

    if (Array.isArray(configuredDecorators) === false) {
      throw new Error(`ConfigError:
      The decorator configuration for \`${this.command}\` is not a valid array. Please make
      sure your configuration is correct
      `);
    }

    // Try to import the configured decorators
    const decoratorClasses: Decorator[] = [];
    if (typeof configuredDecorators !== 'string') {
      for (let i = 0; i < configuredDecorators.length; i = i + 1) {
        const decorator = configuredDecorators[i];
        try {
          let decoratorClass = await import(decorator);
          decoratorClass = decoratorClass.default;
          decoratorClasses.push(new decoratorClass());
        } catch (error) {
          error.message =
            `Could not find module \`${decorator}\`. Run \`npm install ${decorator}\` to install`;
          throw error;
        }
      }
    }

    return decoratorClasses;
  }

  /**
   * Resolve the configured factories for a command and return an instance of each.
   */
  public async resolveFactories(): Promise<Factory[]> {
    // Fetch configured factories from config
    const configuredFactories = this.config.get(`commands.${this.signature}.factories`);
    if (configuredFactories == null) {
      throw new Error(`ConfigError:
      No resolvable factory configuration could be found for \`${this.command}\`.
      Please check your configuration file, and make sure that a value has been
      defined for \`${this.signature}.factories\`
      `);
    }

    if (Array.isArray(configuredFactories) === false) {
      throw new Error(`ConfigError:
      The factory configuration for \`${this.command}\` is not a valid array. Please make
      sure your configuration is correct
      `);
    }

    // Try to import the configured factories
    const factoryClasses: Factory[] = [];
    if (typeof configuredFactories !== 'string') {
      for (let i = 0; i < configuredFactories.length; i = i + 1) {
        const factory = configuredFactories[i];
        try {
          let factoryClass = await import(factory);
          factoryClass = factoryClass.default;
          factoryClasses.push(new factoryClass());
        } catch (error) {
          error.message =
            `Could not find module \`${factory}\`. Run \`npm install ${factory}\` to install`;
          throw error;
        }
      }
    }

    return factoryClasses;
  }
}
