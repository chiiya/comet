import { parseToml } from '../helpers/Helpers';
import { CometConfig } from '@comet-cli/types';
const cosmiconfig = require('cosmiconfig');
const assign = require('assign-deep');
const defaultConfig = require('./default');

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

    // Merge both
    if (config && config.config) {
      return assign({}, defaultConfig, config.config);
    }
    return defaultConfig;
  }
}
