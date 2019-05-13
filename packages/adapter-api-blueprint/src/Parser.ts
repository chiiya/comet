import { ApiBlueprintSpec } from '../types/blueprint';
import { readFile } from 'fs-extra';
import { LoggerInterface } from '@comet-cli/types';
import { ucfirst } from '@comet-cli/helper-utils';
const { promisify } = require('util');
const drafter = require('drafter');

export default class Parser {
  /**
   * Load an API Blueprint specification from file (path).
   * @param path
   * @param logger
   */
  public static async load(path: string, logger: LoggerInterface): Promise<ApiBlueprintSpec> {
    const source = await readFile(path, 'utf8');
    const parse = promisify(drafter.parse);
    let result: ApiBlueprintSpec;
    try {
      result = await parse(source, { type: 'ast', requireBlueprintName: true });
    } catch (error) {
      this.printError(error.result, source, logger);
      return process.exit(-1);
    }
    if (result.error && result.error.code !== 0) {
      this.printError(result, source, logger);
    }

    if (result.warnings && result.warnings.length > 0) {
      logger.warn('Input file parsed. The following warnings were encountered:');
      this.printWarnings(result.warnings, source, logger);
    } else {
      logger.succeed('Input file parsed');
    }
    logger.spin('Transforming API Blueprint model');
    return result;
  }

  /**
   * Print the warnings encountered as a table
   * @param warnings
   * @param source
   * @param logger
   */
  protected static printWarnings(warnings: any[], source: string, logger: LoggerInterface): void {
    const messages = [];
    for (const warning of warnings) {
      messages.push([
        this.getLineNumber(warning.location, source),
        ucfirst(this.fixWarningMessage(warning.message)),
        warning.code,
      ]);
    }
    logger.printWarnings(messages);
  }

  /**
   * Print the errors encountered as a table
   * @param error
   * @param source
   * @param logger
   */
  protected static printError(error: any, source: string, logger: LoggerInterface): void {
    logger.fail('Could not parse input file. The following errors were encountered:');
    const errors = [
      [this.getLineNumber(error.error.location, source), ucfirst(error.error.message), error.error.code],
    ];
    logger.printErrors(errors);
    process.exit(-1);
  }

  /**
   * Get the line number of a warning message.
   * @param locations
   * @param source
   */
  protected static getLineNumber(locations: any[], source: string): number {
    return source.substr(0, locations[0].index).split('\n').length;
  }

  /**
   * Fix a grammar mistake in one of the warning messages.
   * @param message
   */
  protected static fixWarningMessage(message: string) {
    if (message.startsWith('Ignoring additional response header(s)')) {
      return 'Ignoring additional response header(s), specify them in the referenced model definition instead';
    }
    return message;
  }
}
