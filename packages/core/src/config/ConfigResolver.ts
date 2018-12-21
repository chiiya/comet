import { parseToml } from '../helpers/Helpers';
import { CometConfig } from '@comet-cli/types';
const cosmiconfig = require('cosmiconfig');
const assign = require('assign-deep');

export default class ConfigResolver {
  public static execute(): CometConfig {
    // Load user configuration
    const explorer = cosmiconfig('comet', {
      searchPlaces: [
        'package.json',
        '.cometrc',
        '.cometrc.js',
        '.cometrc.toml',
      ],
      loaders: {
        '.toml': parseToml,
      },
    });
    const config = explorer.searchSync();
    // Load default configuration
    const defaultConfig = require('./default');

    // Merge both
    if (config && config.config) {
      return assign({}, defaultConfig, config.config);
    }
    return defaultConfig;
  }
}
