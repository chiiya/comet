import { CometConfig, ConfigValue } from '@comet-cli/types';
import ConfigResolver from './ConfigResolver';
const dotProp = require('dot-prop');

export default class ConfigRepository {
  /** The config store */
  protected config: CometConfig;

  /**
   * ConfigRepository constructor.
   * Resolve config by merging default and user provided config.
   */
  constructor() {
    this.config = ConfigResolver.execute();
  }

  /**
   * Get all config values.
   * @return {CometConfig}
   */
  get all(): CometConfig {
    return this.config;
  }

  /**
   * Get the value of a config entry using dot notation (`get(commands.tests.make.parser)`).
   * @param key {string}
   * @return {ConfigValue}
   */
  get(key: string): ConfigValue | undefined {
    let result = dotProp.get(this.config, key);
    // If not found (undefined), try to fetch a default value
    if (result == null) {
      const selectors = key.split('.');
      result = dotProp.get(this.config, `default.${selectors[selectors.length - 1]}`);
    }

    return result;
  }

  /**
   * Set the value of a config entry using dot notation.
   * @param key {string}
   * @param value {ConfigValue}
   */
  set(key: string, value: ConfigValue) {
    dotProp.set(this.config, key, value);
  }

  /**
   * Check whether a config entry is set (using dot notation).
   * @param key {string}
   * @return boolean
   */
  has(key: string) {
    return dotProp.has(this.config, key);
  }
}
