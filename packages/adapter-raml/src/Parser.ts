import { RamlParserError } from 'raml-1-parser/dist/parser/highLevelAST';
import { LoggerInterface } from '@comet-cli/types';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

const raml = require('raml-1-parser');

export default class Parser {
  /**
   * Load a RAML specification from file (path) or passed object.
   * @param pathOrObject
   * @param logger
   */
  public static async load(pathOrObject: string, logger: LoggerInterface): Promise<Api> {
    try {
      const spec = await raml.loadApi(pathOrObject, { rejectOnErrors: true });
      return spec;
    } catch (error) {
      if (error.name === 'ApiLoadingError') {
        const issues: RamlParserError[] = error.parserErrors;
        this.logIssues(issues, logger);
      } else {
        throw error;
      }
    }
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

    this.printIssues(errors, logger);
    this.printIssues(warnings, logger);
  }

  /**
   * Print the errors or warnings to the console.
   * @param issues
   * @param logger
   */
  protected static printIssues(issues: RamlParserError[], logger: LoggerInterface): void {
    logger.fail('Could not parse input file. The following issues were encountered:');
    const rows = [];
    for (const issue of issues) {
      rows.push([issue.range.start.line, issue.message, issue.code]);
    }
    if (issues[0].isWarning === true) {
      logger.printWarnings(rows);
    } else {
      logger.printErrors(rows);
    }
    process.exit(-1);
  }
}
