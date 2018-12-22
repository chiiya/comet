import ConfigRepository from '../config/ConfigRepository';
import { Parser } from '@comet-cli/types';

export default class Resolver {
  /** Comet config repository */
  protected config: ConfigRepository;

  /** Command signature with dot notation (make.tests) */
  protected signature: string;

  /**
   * Resolver constructor.
   * @param config
   * @param signature
   */
  constructor(config: ConfigRepository, signature: string) {
    this.config = config;
    this.signature = signature.replace(':', '.');
  }

  /**
   * Resolve the configured parser for a command and return an instance of it.
   */
  public async resolveParser(): Promise<Parser> {
    // Fetch configured parser from config
    const configuredParser = this.config.get(`commands.${this.signature}.parser`);
    if (configuredParser == null) {
      throw new Error(`
      No parser configuration could be found for ${this.signature}.
      Please check your configuration file, and make sure that a value has been
      defined for ${this.signature}.parser
      `);
    }

    // Try to import the configured parser
    let parserClass;
    try {
      parserClass = await import(String(configuredParser));
      parserClass = parserClass.default;
    } catch (error) {
      error.message =
        `Could not find module ${configuredParser}. Run npm install ${configuredParser} to install.`;
      throw error;
    }

    return new parserClass();
  }
}
