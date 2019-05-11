import { CommandConfig, Factory, OpenApiSpec } from '@comet-cli/types';
import { ensureDir, readFile, writeFile, writeJson } from 'fs-extra';
import { xml2js, js2xml } from 'xml-js';
import { Parameter, TestCase } from '@comet-cli/decorator-tests/types/tests';
import { Action } from '../types/legacy';
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
    await ensureDir(path.resolve(__dirname, config.output));
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
    // Step 4: Create hook trait
    await LaravelTestsFactory.createHookTraitFile(config);
    // Step 5: Create test case definitions
    await LaravelTestsFactory.createTestCases(model.decorated.testSuite.testCases, config);
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
  protected static async updateComposerConfig() {
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

  /**
   * Create the template php hook trait file.
   * @param config
   */
  protected static async createHookTraitFile(config: CommandConfig) {
    await writeFile(path.join(config.output, 'HasHooks.php'), `<?php

namespace Tests\\Comet;

trait HasHooks
{
    /**
     * Hook to be executed before every request.
     * You can customize the request here, e.g.:
     *      return $this->withHeaders([
     *          'X-Authorization' => abcddefg12345,
     *      ]);
     * @return $this
     */
    protected function before() {
        return $this;
    }

}

`);
  }

  protected static async createTestCases(testCases: TestCase[], config: CommandConfig) {
    let body = LaravelTestsFactory.getFileHeader();
    const baseUrl = config.base_url;
    const outputDir = config.output;
    testCases.forEach((testCase: TestCase) => {
      const url = LaravelTestsFactory.getResolvedUrl(baseUrl, testCase);
      if (testCase.isFaulty === false) {
        body += LaravelTestsFactory.createNominalDefinition(testCase, url, outputDir);
      } else {
        body += LaravelTestsFactory.createFaultyDefinition(testCase, url);
      }
    });
    body += LaravelTestsFactory.getFileFooter();
    await writeFile(path.join(config.output, 'CometApiTest.php'), body);
  }

  /**
   * Get the full url with resolved path and query parameters.
   * @param baseUrl
   * @param testCase
   */
  protected static getResolvedUrl(baseUrl: string, testCase: TestCase): string {
    let url = testCase.path;
    let hasAddedQueryParameter = false;
    testCase.parameters.forEach((parameter: Parameter) => {
      if (parameter.location === 'path') {
        const replace = `{${parameter.name}}`;
        const expression = new RegExp(replace, 'gi');
        url = url.replace(expression, parameter.value);
      }
      if (parameter.location === 'query') {
        const separator = hasAddedQueryParameter ? '&' : '?';
        url = `${url}${separator}${parameter.name}=${parameter.value}`;
        hasAddedQueryParameter = true;
      }
    });
    return `${baseUrl}${url}`;
  }

  protected static getFileHeader(): string {
    return `<?php

namespace Tests\\Comet;

use Tests\\TestCase;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use EnricoStahn\\JsonAssert\\Assert as JsonAssert;

class CometApiTest extends TestCase
{
    use RefreshDatabase, JsonAssert, HasHooks;

    /**
     * Run seeds.
     */
    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }`;
  }

  protected static createNominalDefinition(testCase: TestCase, url: string, outputDir: string): string {
    return `

    public function test${testCase.name.charAt(0).toUpperCase() + testCase.name.slice(1)}()
    {
        $body = ${testCase.hasRequestBody ? `'${testCase.requestBody}'` : 'null'};
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('${testCase.method.toUpperCase()}', '${url}', $headers, $body);
        $response->assertSuccessful();
        ${testCase.schema ? this.getJsonSchemaAssertion(outputDir, testCase) : ''}
    }`;
  }

  protected static createFaultyDefinition(testCase: TestCase, url: string): string {
    return `

    public function test${testCase.name.charAt(0).toUpperCase() + testCase.name.slice(1)}()
    {
        $body = ${testCase.hasRequestBody ? `'${testCase.requestBody}'` : '\'\''};
        $headers = $this->getJsonHeaders($body);
        $response = $this->executeRequest('${testCase.method.toUpperCase()}', '${url}', $headers, $body);
        $this->assertHasClientError($response);
    }`;
  }

  protected static getFileFooter(): string {
    return `

    /**
     * Assert that a test response returned a client error (4xx).
     * @param \\Illuminate\\Foundation\\Testing\\TestResponse $response
     */
    protected function assertHasClientError($response)
    {
        $this->assertTrue(
            $response->isClientError(),
            'Response status code ['.$response->getStatusCode().'] is not a client error status code.'
        );
    }

    /**
     * Get default JSON request headers.
     * @param string $body
     * @return array
     */
    protected function getJsonHeaders($body)
    {
        return  [
            'CONTENT_LENGTH' => mb_strlen($body, '8bit'),
            'CONTENT_TYPE' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    /**
     * Execute the test request.
     * @param $method
     * @param $path
     * @param $headers
     * @param $body
     * @return \\Illuminate\\Foundation\\Testing\\TestResponse
     */
    protected function executeRequest($method, $path, $headers, $body)
    {
        return $this
            ->before()
            ->call($method, $path, [], [], [], $this->transformHeadersToServerVars($headers), $body);
    }
}
    `;
  }

  protected static getJsonSchemaAssertion(outputDir: string, testCase: TestCase): string {
    const schemaPath = `base_path().'/${outputDir}/schemas/${testCase.schema}.json'`;
    return `$responseContent = $response->getContent();
        $this->assertJsonMatchesSchema(json_decode($responseContent), ${schemaPath});`;
  }
}
