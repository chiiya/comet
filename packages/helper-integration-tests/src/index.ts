import {
  ApiModel,
  CommandConfig,
  Operation, Parameter,
  Schema,
} from '@comet-cli/types';
import { camelize, slugify } from '@comet-cli/helper-utils';
import Combination from './Combination';
import MissingExampleException from './MissingExampleException';
import { Parameters, TestCase, TestSuite } from '../types';
import { parseTestCaseName, parseUrl } from './helpers';
import FaultyValueResolver from './FaultyValueResolver';

export default class TestSuiteCreator {
  public static execute(model: ApiModel, config: CommandConfig): TestSuite {
    const testSuite = this.createTestSuite(model, config);
    for (const group of model.groups) {
      for (const resource of group.resources) {
        for (const operation of resource.operations) {
          testSuite.testCases.push(...this.buildOperation(model, operation, resource.path));
        }
      }
    }
    for (const resource of model.resources) {
      for (const operation of resource.operations) {
        testSuite.testCases.push(...this.buildOperation(model, operation, resource.path));
      }
    }

    return testSuite;
  }

  protected static buildOperation(
    model: ApiModel,
    operation: Operation,
    path: string,
  ): TestCase[] {
    const testCases: TestCase[] = [];

    const example = this.getExampleRequest(path, operation);
    let exampleString = null;

    if (example !== undefined) {
      exampleString = this.getExampleAsString(path, operation, example);
    }

    // Find corresponding response JSON Schema
    const schema = this.getSchema(operation);

    // Build parameters
    if (operation.parameters) {
      const parameters = this.getParameters(path, operation);
      const combinations = Combination.combinations(parameters.optional);
      // Create one test case with just the required parameters...
      testCases.push(
        this.createTestCase(
          path,
          operation,
          parameters.required,
          exampleString,
          schema,
        ),
      );
      // ... and one for each combination of optional parameters (+ required)
      for (const combination of combinations) {
        testCases.push(
          this.createTestCase(
            path,
            operation,
            [...parameters.required, ...combination],
            exampleString,
            schema,
          ),
        );
      }
      // Create faulty test cases if it has a request body
      if (example !== undefined && schema !== undefined) {
        testCases.push(...this.createFaultyTestCases(
          path,
          operation,
          parameters.required,
          schema,
          example,
        ));
      }
    } else {
      // No parameters
      testCases.push(
        this.createTestCase(path, operation, [], exampleString, schema),
      );
      // Create faulty test cases
      if (example !== undefined && schema !== undefined) {
        testCases.push(...this.createFaultyTestCases(
          path,
          operation,
          [],
          schema,
          example,
        ));
      }
    }
    return testCases;
  }

  protected static getExampleRequest(path: string, operation: Operation): string | object | undefined {
    if (operation.request && operation.request.body) {
      if (
        operation.request.body['application/json']
        && operation.request.body['application/json'].examples
        && operation.request.body['application/json'].examples.length > 0
      ) {
        return operation.request.body['application/json'].examples[0];
      }
      throw new MissingExampleException(
        `\`${operation.method.toUpperCase()} ${path}\`: only JSON examples are supported at this time`,
      );
    }
    const method = operation.method.toUpperCase();
    if (method === 'PUT' || method === 'POST' || method === 'PATCH') {
      throw new MissingExampleException(
        `Missing example request for \`${operation.method.toUpperCase()} ${path}\``,
      );
    }
  }

  protected static getExampleAsString(path: string, operation: Operation, example: any): string | undefined {
    if (typeof example === 'string') {
      return example;
    }
    if (typeof example === 'object') {
      return JSON.stringify(example);
    }
    throw new MissingExampleException(
      `Example request body for \`${operation.method.toUpperCase()} ${path}\` should be object or string`,
    );
  }

  protected static getSchema(operation: Operation): Schema | undefined {
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
   * Create TestSuite model.
   *
   * @param model
   * @param config
   */
  protected static createTestSuite(
    model: ApiModel,
    config: CommandConfig,
  ): TestSuite {
    return {
      name: 'CometApiTest',
      url: parseUrl(config, model),
      testCases: [],
    };
  }

  /**
   * Get resolved required and optional query parameters.
   *
   * @param path
   * @param operation
   */
  protected static getParameters(path: string, operation: Operation): Parameters {
    // Get a list of all inferable parameters
    const requiredParameters: Parameter[] = [];
    const optionalParameters: Parameter[] = [];
    for (const param of operation.parameters) {
      if (param.example === undefined) {
        throw new MissingExampleException(
          `\`${operation.method.toUpperCase()} ${path}\`: Missing example value for parameter ${param.name}`,
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

  protected static createFaultyTestCases(
    path: string,
    operation: Operation,
    parameters: Parameter[],
    schema: Schema,
    example: string | object,
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
      for (const value of faultyValues) {
        const bodyCopy = { ...body };
        bodyCopy[key] = value.value;
        const testCase: TestCase = {
          method: operation.method.toUpperCase(),
          path: path,
          parameters: parameters,
          hasRequestBody: example !== undefined,
          requestBody: JSON.stringify(bodyCopy),
          schema: JSON.stringify(schema),
          isFaulty: true,
        };
        let attributeName = camelize(slugify(key));
        attributeName = `${attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}`;
        testCase.name = `${parseTestCaseName(testCase, operation)}WithFaulty${attributeName}${value.fault}`;
        testCases.push(testCase);
      }
    }
    return testCases;
  }

  /**
   * Create a TestCase object.
   *
   * @param path
   * @param operation
   * @param parameters
   * @param example
   * @param schema
   *
   * @returns ITestCase
   */
  protected static createTestCase(
    path: string,
    operation: Operation,
    parameters: Parameter[],
    example: string,
    schema: Schema,
  ): TestCase {
    const testCase: TestCase = {
      method: operation.method.toUpperCase(),
      path: path,
      parameters: parameters,
      hasRequestBody: example !== undefined,
      requestBody: example,
      schema: JSON.stringify(schema),
      isFaulty: false,
    };
    testCase.name = parseTestCaseName(testCase, operation);
    return testCase;
  }
}
