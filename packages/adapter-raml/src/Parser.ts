import { RamlParserError } from 'raml-1-parser/dist/parser/highLevelAST';
import { LoggerInterface } from '@comet-cli/types';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import ParsingException from './ParsingException';

const raml = require('raml-1-parser');

export default class Parser {
  /**
   * Load a RAML specification from file (path) or passed object.
   * @param pathOrObject
   * @param logger
   */
  public static async load(pathOrObject: string, logger: LoggerInterface): Promise<Api> {
    let result: Api;
    try {
      result = await raml.loadApi(pathOrObject);
      result = result.expand();
    } catch (error) {
      if (error.name === 'ApiLoadingError') {
        const issues: RamlParserError[] = error.parserErrors;
        this.logIssues(issues, logger);
      } else {
        throw error;
      }
    }

    if (result.RAMLVersion() === 'RAML08') {
      throw new ParsingException('Input specification is RAMLv0.8. The minimum RAML version supported is 1.0');
    }
    if (result.errors().length > 0) {
      this.logIssues(result.errors(), logger);
    } else {
      logger.succeed('Input file parsed');
    }
    logger.spin('Transforming RAML model');
    return result;
  }

  /**
   * Print all the encountered errors and warnings to the console, separately.
   * @param issues
   * @param logger
   */
  protected static logIssues(issues: RamlParserError[], logger: LoggerInterface): void {
    const errors: RamlParserError[] = [];
    const warnings: RamlParserError[] = [];

    for (const issue of issues) {
      if (issue.isWarning === true) {
        warnings.push(issue);
      } else {
        errors.push(issue);
      }
    }

    if (errors.length > 0) {
      logger.fail('Could not parse input file. The following issues were encountered:');
      this.printIssues(errors, logger);
      process.exit(-1);
    }
    if (warnings.length > 0) {
      logger.warn('Input file parsed. The following warnings were encountered:');
      this.printIssues(warnings, logger);
    }
  }

  /**
   * Print the errors or warnings to the console.
   * @param issues
   * @param logger
   */
  protected static printIssues(issues: RamlParserError[], logger: LoggerInterface): void {
    const rows = [];
    for (const issue of issues) {
      rows.push([issue.range.start.line, issue.message, issue.code]);
    }
    if (issues[0].isWarning === true) {
      logger.printWarnings(rows);
    } else {
      logger.printErrors(rows);
    }
  }
}
