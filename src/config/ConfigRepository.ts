import { CometConfig, ConfigValue } from '../types/Config';
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
   * Get the value of a config entry.
   * @param key {string}
   * @return {ConfigValue}
   */
  get(key: string): ConfigValue {
    return dotProp.get(this.config, key);
  }

  /**
   * Set the value of a config entry.
   * @param key {string}
   * @param value {ConfigValue}
   */
  set(key: string, value: ConfigValue) {
    dotProp.set(this.config, key, value);
  }

  /**
   * Check whether a config entry has been set.
   * @param key {string}
   * @return boolean
   */
  has(key: string) {
    return dotProp.has(this.config, key);
  }
}
