import { ApiModel, Parameter, Schema } from '@comet-cli/types';
import { camelize, slugify, getAllOperationsWithUris, EnhancedOperation } from '@comet-cli/helper-utils';
import Combination from './Combination';
import MissingExampleException from './MissingExampleException';
import { Parameters, TestCase, TestSuite } from '../types';
import { buildTestCaseName } from './helpers';
import FaultyValueResolver from './FaultyValueResolver';

export default class TestSuiteCreator {
  /**
   * Build an integration test suite model with nominal and faulty test cases for all API operations.
   * @param model
   * @param uri
   */
  public static execute(model: ApiModel, uri: string): TestSuite {
    const testSuite: TestSuite = {
      name: 'CometApiTest',
      url: uri,
      testCases: [],
    };
    const operations: EnhancedOperation = getAllOperationsWithUris(model);
    for (const operation of operations) {
      testSuite.testCases.push(...this.buildOperation(operation));
    }

    return testSuite;
  }

  /**
   * Build test cases for a given API operation.
   * @param operation
   */
  protected static buildOperation(operation: EnhancedOperation): TestCase[] {
    const testCases: TestCase[] = [];

    // Get request example
    const example = this.getExampleRequest(operation);
    let exampleString = null;
    if (example !== undefined) {
      exampleString = this.getExampleAsString(operation, example);
    }

    // Find corresponding response JSON Schema
    const schema = this.getSchema(operation);

    // Build test cases
    if (operation.parameters) {
      const parameters = this.getParameters(operation);
      const combinations = Combination.combinations(parameters.optional);
      // Create one test case with just the required parameters...
      testCases.push(this.createTestCase(operation, parameters. required, exampleString, schema));
      // ... and one for each combination of optional parameters (+ required)
      for (const combination of combinations) {
        testCases.push(
          this.createTestCase(
            operation,
            [...parameters.required, ...combination],
            exampleString,
            schema,
          ),
        );
      }
      // Create faulty test cases if it has a request body
      if (example !== undefined && schema !== undefined) {
        testCases.push(...this.createFaultyTestCases(operation, parameters.required, example, schema));
      }
    } else {
      // No parameters
      testCases.push(this.createTestCase(operation, [], exampleString, schema));
      // Create faulty test cases
      if (example !== undefined && schema !== undefined) {
        testCases.push(...this.createFaultyTestCases(operation, [], example, schema));
      }
    }

    return testCases;
  }

  /**
   * Get an example request for an API operation.
   * @param operation
   */
  protected static getExampleRequest(operation: EnhancedOperation): string | object | undefined {
    if (operation.request && operation.request.body) {
      if (
        operation.request.body['application/json']
        && operation.request.body['application/json'].examples
        && operation.request.body['application/json'].examples.length > 0
      ) {
        return operation.request.body['application/json'].examples[0];
      }
    }
    const method = operation.method.toUpperCase();
    if (method === 'PUT' || method === 'POST' || method === 'PATCH') {
      throw new MissingExampleException(
        `Missing JSON example request for \`${operation.method.toUpperCase()} ${operation.uri}\``,
      );
    }
  }

  /**
   * Convert the example request to a string.
   * @param operation
   * @param example
   */
  protected static getExampleAsString(operation: EnhancedOperation, example: any): string | undefined {
    if (typeof example === 'string') {
      return example;
    }
    if (typeof example === 'object') {
      return JSON.stringify(example);
    }
    throw new MissingExampleException(
      `Example request body for \`${operation.method.toUpperCase()} ${operation.uri}\` should be object or string`,
    );
  }

  /**
   * Get the schema definition for a JSON response.
   * @param operation
   */
  protected static getSchema(operation: EnhancedOperation): Schema | undefined {
    const responses = operation.responses;
    for (const code of Object.keys(responses)) {
      if (
        code.startsWith('2') === true
        && operation.responses[code].body
        && operation.responses[code].body['application/json']
      ) {
        return operation.responses[code].body['application/json'].schema;
      }
    }
  }

  /**
   * Get resolved required and optional query parameters.
   *
   * @param operation
   */
  protected static getParameters(operation: EnhancedOperation): Parameters {
    // Get a list of all inferable parameters
    const requiredParameters: Parameter[] = [];
    const optionalParameters: Parameter[] = [];
    for (const param of operation.parameters) {
      if (param.example === undefined) {
        throw new MissingExampleException(
          `\`${operation.method.toUpperCase()} ${operation.uri}\`: Missing example value for parameter ${param.name}`,
        );
      } else {
        if (param.required === true) {
          requiredParameters.push(param);
        } else {
          optionalParameters.push(param);
        }
      }
    }

    return {
      required: requiredParameters,
      optional: optionalParameters,
    };
  }

  /**
   * Create a faulty test case (faulty value for request attribute).
   * @param operation
   * @param parameters
   * @param schema
   * @param example
   */
  protected static createFaultyTestCases(
    operation: EnhancedOperation,
    parameters: Parameter[],
    example: string | object,
    schema: Schema,
  ) {
    const testCases = [];
    let body;
    if (typeof example === 'string') {
      body = JSON.parse(example);
    } else {
      body = example;
    }
    for (const key of Object.keys(body)) {
      const faultyValues = FaultyValueResolver.resolveFaultyValues(key, schema);
      let attributeName = camelize(slugify(key));
      attributeName = `${attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}`;
      for (const value of faultyValues) {
        const bodyCopy = { ...body };
        bodyCopy[key] = value.value;
        const testCase: TestCase = {
          name: `${buildTestCaseName(operation, parameters)}WithFaulty${attributeName}${value.fault}`,
          method: operation.method.toUpperCase(),
          path: operation.uri,
          parameters: parameters,
          hasRequestBody: example !== undefined,
          requestBody: JSON.stringify(bodyCopy),
          schema: JSON.stringify(schema),
          isFaulty: true,
        };
        testCases.push(testCase);
      }
    }
    return testCases;
  }

  /**
   * Create a nominal test case.
   * @param operation
   * @param parameters
   * @param example
   * @param schema
   */
  protected static createTestCase(
    operation: EnhancedOperation,
    parameters: Parameter[],
    example: string,
    schema: Schema,
  ): TestCase {
    return {
      name: buildTestCaseName(operation, parameters),
      method: operation.method.toUpperCase(),
      path: operation.uri,
      parameters: parameters,
      hasRequestBody: example !== undefined,
      requestBody: example,
      schema: JSON.stringify(schema),
      isFaulty: false,
    };
  }
}
