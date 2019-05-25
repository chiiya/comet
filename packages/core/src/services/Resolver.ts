import ConfigRepository from '../config/ConfigRepository';
import { AdapterInterface, PluginInterface } from '@comet-cli/types';

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
   * Resolve the configured adapter for a command and return an instance of it.
   */
  public async resolveAdapter(detected: string | null): Promise<AdapterInterface> {
    // Fetch configured adapter from config
    const configuredAdapter = this.config.get(`commands.${this.signature}.adapter`);
    if (configuredAdapter == null && detected === null) {
      throw new Error(`ConfigError:
      No adapter configuration could be found for \`${this.command}\`.
      Please check your configuration file, and make sure that a value has been
      defined for \`${this.signature}.adapter\`
      `);
    }

    const adapter = configuredAdapter || detected;

    // Try to import the configured adapter
    try {
      const adapterClass = await import(String(adapter));
      return new adapterClass();
    } catch (error) {
      error.message =
        `Could not find module \`${adapter}\`. Run \`npm install ${adapter}\` to install`;
      throw error;
    }
  }

  /**
   * Resolve the configured plugins for a command and return an instance of each.
   */
  public async resolvePlugins(): Promise<PluginInterface[]> {
    // Fetch configured plugins from config
    const configuredPlugins = <string[]>this.config.get(`commands.${this.signature}.plugins`);
    if (configuredPlugins == null) {
      throw new Error(`ConfigError:
      No resolvable plugin configuration could be found for \`${this.command}\`.
      Please check your configuration file, and make sure that a value has been
      defined for \`${this.signature}.plugins\`
      `);
    }

    if (Array.isArray(configuredPlugins) === false) {
      throw new Error(`ConfigError:
      The plugin configuration for \`${this.command}\` is not a valid array. Please make
      sure your configuration is correct
      `);
    }

    // Try to import the configured plugins
    const pluginClasses: PluginInterface[] = [];
    for (const plugin of configuredPlugins) {
      try {
        const pluginClass = await import(plugin);
        pluginClasses.push(new pluginClass());
      } catch (error) {
        error.message =
          `Could not find module \`${plugin}\`. Run \`npm install ${plugin}\` to install\n${error.message}`;
        throw error;
      }
    }

    return pluginClasses;
  }
}
