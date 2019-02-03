import { CommandConfig, Factory, OpenApiSpec } from '@comet-cli/types';
import { ensureDir, readFile, writeFile, writeJson } from 'fs-extra';
import { xml2js, js2xml } from 'xml-js';
import { TestCase } from '@comet-cli/decorator-tests/types/tests';
import { Action } from '@comet-cli/decorator-json-schemas/types/json-schema';
const path = require('path');

export default class LaravelTestsFactory implements Factory {
  /**
   * Get the module name.
   */
  getName(): string {
    return 'factory-tests-laravel';
  }

  /**
   * Execute the factory, creating Laravel test cases.
   * @param model
   * @param config
   */
  async execute(model: OpenApiSpec, config: CommandConfig): Promise<string[]> {
    const warnings: string[] = [];
    const outputDir = config.output;
    // Step 1: Update the PHPUnit configuration file
    try {
      await LaravelTestsFactory.updatePhpUnitConfig(outputDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        warnings.push('No PHPUnit configuration file found. Could not add TestSuite entry.');
      } else {
        throw error;
      }
    }
    // Step 2: Update the composer.json file
    try {
      await LaravelTestsFactory.updateComposerConfig();
    } catch (error) {
      if (error.code === 'ENOENT') {
        warnings.push('No composer.json file found. Could not add PHP dependencies.');
      } else {
        throw error;
      }
    }
    // Step 3: Write relevant JSON Schemas to files
    await LaravelTestsFactory.writeJsonSchemaFiles(model, config);
    return Promise.resolve(warnings);
  }

  /**
   * Update the PHPUnit configuration to include an additional test suite.
   * @param {string} outputDir
   */
  protected static async updatePhpUnitConfig(outputDir: string) {
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
        _text: path.join(outputDir, 'Comet'),
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
  protected static async updateComposerConfig() {
    const file = await readFile('composer.json', 'utf-8');
    const object = JSON.parse(file);
    object['require']['estahn/phpunit-json-assertions'] = '^3.0';
    await writeJson('composer.json', object, { spaces: 4 });
  }

  /**
   * Write relevant json schemas into the tests folder.
   * @param model
   * @param config
   */
  protected static async writeJsonSchemaFiles(model: OpenApiSpec, config: CommandConfig) {
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
}
