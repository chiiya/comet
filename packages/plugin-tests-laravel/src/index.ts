import { ApiModel, CommandConfig, LoggerInterface, PluginInterface } from '@comet-cli/types';
import { ensureDir, readFile, writeFile, writeJson } from 'fs-extra';
import { xml2js, js2xml } from 'xml-js';
import { Action } from '../types/legacy';
import { TestCase } from '@comet-cli/helper-integration-tests/types';
const path = require('path');
const handlebars = require('handlebars');

export default class LaravelTestsPlugin implements PluginInterface {
  /**
   * Execute the plugin, creating Laravel test cases.
   * @param model
   * @param config
   * @param logger
   */
  async execute(model: ApiModel, config: CommandConfig, logger: LoggerInterface): Promise<void> {
    const warnings: string[] = [];
    const outputDir = config.output;
    await ensureDir(path.resolve(__dirname, config.output));
    // Step 1: Update the PHPUnit configuration file
    try {
      await this.updatePhpUnitConfig(outputDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        warnings.push('No PHPUnit configuration file found. Could not add TestSuite entry.');
      } else {
        throw error;
      }
    }
    // Step 2: Update the composer.json file
    try {
      await this.updateComposerConfig();
    } catch (error) {
      if (error.code === 'ENOENT') {
        warnings.push('No composer.json file found. Could not add PHP dependencies.');
      } else {
        throw error;
      }
    }
    // Step 3: Write relevant JSON Schemas to files
    await this.writeJsonSchemaFiles(model, config);
    // Step 4: Create hook trait
    await this.createHookTraitFile(config);
    // Step 5: Create test case definitions
    await this.createTestCases(model.decorated.testSuite.testCases, config);
    this.printWarnings(warnings, logger);
  }

  /**
   * Update the PHPUnit configuration to include an additional test suite.
   * @param outputDir
   */
  protected async updatePhpUnitConfig(outputDir: string) {
    const file = await readFile('phpunit.xml', 'utf-8');
    const object = await xml2js(file, { compact: true });
    const testSuite = {
      _attributes: {
        name: 'Comet',
      },
      directory: {
        _attributes: {
          suffix: 'Test.php',
        },
        _text: `./${outputDir}`,
      },
    };
    // @ts-ignore
    if (object.phpunit.testsuites && Array.isArray(object.phpunit.testsuites.testsuite)) {
      // @ts-ignore
      const testSuites = object.phpunit.testsuites.testsuite;
      const index = testSuites.findIndex(entry => entry._attributes.name === 'Comet');
      if (index !== -1) {
        testSuites.splice(index, 1);
      }
      testSuites.push(testSuite);
      // @ts-ignore
      object.phpunit.testsuites.testsuite = testSuites;
    } else {
      // @ts-ignore
      object.phpunit.testsuites = {
        testsuite: [testSuite],
      };
    }

    const xml = js2xml(object, { compact: true, ignoreComment: true, spaces: 4 });
    await writeFile('phpunit.xml', xml, 'utf8');
  }

  /**
   * Update the composer.json file and add missing dependencies.
   */
  protected async updateComposerConfig() {
    const file = await readFile('composer.json', 'utf-8');
    const object = JSON.parse(file);
    object['require-dev']['estahn/phpunit-json-assertions'] = '^3.0';
    await writeJson('composer.json', object, { spaces: 4 });
  }

  /**
   * Write relevant json schemas into the tests folder.
   * @param model
   * @param config
   */
  protected async writeJsonSchemaFiles(model: ApiModel, config: CommandConfig) {
    const usedSchemas = new Set(model.decorated.testSuite.testCases.map((testCase: TestCase) => {
      return testCase.schema;
    }));
    const schemasToWrite = model.decorated.jsonSchemas.filter((action: Action) => {
      return action.$operation === 'response' && usedSchemas.has(action.$name) === true;
    });
    for (let i = 0; i < schemasToWrite.length; i += 1) {
      const action: Action = schemasToWrite[i];
      await ensureDir(path.join(config.output, 'schemas'));
      const file = path.join(config.output, 'schemas', `${action.$name}.json`);
      await writeJson(file, action.schema, { spaces: 4 });
    }
  }

  /**
   * Create the template php hook trait file.
   * @param config
   */
  protected async createHookTraitFile(config: CommandConfig) {
    const source = await readFile('./stubs/hooks.hbs');
    await writeFile(path.join(config.output, 'HasHooks.php'), source);
  }

  /**
   * Write the test cases to file.
   * @param testCases
   * @param config
   */
  protected async createTestCases(testCases: TestCase[], config: CommandConfig) {
    const data = {
      testCases: testCases,
    };
    const outputDir = config.output;
    handlebars.registerHelper('getTestCaseName', (testCase: TestCase) => {
      return testCase.name.charAt(0).toUpperCase() + testCase.name.slice(1);
    });
    handlebars.registerHelper('getBody', (testCase: TestCase) => {
      return testCase.hasRequestBody ? `'${testCase.requestBody}'` : 'null';
    });
    handlebars.registerHelper('getSchemaPath', (testCase: TestCase) => {
      return `base_path().'/${outputDir}/schemas/${testCase.schema}.json'`;
    });
    const source = await readFile('./stubs/testsuite.hbs');
    const template = handlebars.compile(source);
    const result = template(data);
    await writeFile(path.join(config.output, 'CometApiTest.php'), result);
  }

  /**
   * Print the warnings to the console.
   * @param warnings
   * @param logger
   */
  protected printWarnings(warnings: string[], logger: LoggerInterface): void {
    if (warnings.length > 0) {
      logger.warn('Test suite has been created. The following issues occurred:');
    }
    for (const warning of warnings) {
      console.log(warning);
    }
  }
}
