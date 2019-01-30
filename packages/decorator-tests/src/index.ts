import {
  CommandConfig,
  Decorator,
  OpenAPIOperation,
  OpenAPIParameter, OpenAPISchema,
  OpenApiSpec,
} from '@comet-cli/types';
import {
  Action,
  JsonSchema,
  OpenApiSpecJsonDecorated,
} from '@comet-cli/decorator-json-schemas/types/json-schema';
import {
  Method,
  TestCase as ITestCase,
  Parameter,
  ParametersObject,
  TestSuite as ITestSuite, OperationObject, FaultyValue,
} from '../types/tests';
import TestSuite from './TestSuite';
import ParameterResolver from './ParameterResolver';
import Combination from './Combination';
import TestCase from './TestCase';
import RequestBodyResolver from './RequestBodyResolver';
import SchemaValueResolver from './SchemaValueResolver';
import { camelize, getOperationName, slugify } from '@comet-cli/utils';

export default class TestsDecorator implements Decorator {
  /**
   * Get the module name.
   */
  getName(): string {
    return 'decorator-tests';
  }

  execute(model: OpenApiSpec & OpenApiSpecJsonDecorated, config: CommandConfig): Promise<string[]> {
    const testSuite = TestsDecorator.createTestSuite(model, config);
    const warnings: string[] = [];
    // Iterate over all paths and methods to build test cases for each API operation
    Object.keys(model.paths).forEach((path) => {
      const methods: Method[] = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      methods.forEach((method: Method) => {
        const operation = model.paths[path][method];
        if (operation) {
          const result = TestsDecorator.buildOperation(model, operation, path, method);
          warnings.push(...result.warnings);
          testSuite.testCases.push(...result.testCases);
        }
      });
    });

    model.decorated.testSuite = testSuite;
    return Promise.resolve(warnings);
  }

  protected static buildOperation(
    model: OpenApiSpec,
    operation: OpenAPIOperation,
    path: string,
    method: Method,
  ): OperationObject {
    const result = {
      warnings: [],
      testCases: [],
    };
    // Need JSON Schemas to be present on the model.
    if (model.decorated.hasOwnProperty('jsonSchemas') === false) {
      throw new Error(
        'No JSON Schemas found. Please make sure a JSON Schema decorator is run before the tests decorator',
      );
    }

    // Build request body
    let hasRequestBody = false;
    const requestBody = TestsDecorator.getRequestBody(operation, result.warnings);
    if (requestBody !== undefined) {
      hasRequestBody = true;
    }

    // Find corresponding response JSON Schema
    const schema = TestsDecorator.getJsonSchema(model.decorated.jsonSchemas, path, method);

    // Build parameters
    if (operation.parameters) {
      const parameters = TestsDecorator.getParameters(operation, path, method);
      result.warnings.push(...parameters.warnings);
      if (parameters.hasAllRequiredParameters === false) {
        return result;
      }
      const combinations = Combination.combinations(parameters.optional);
      // Create one test case with just the required parameters...
      result.testCases.push(
        TestsDecorator.createTestCase(
          path,
          method,
          operation,
          parameters.required,
          hasRequestBody,
          requestBody,
          schema,
        ),
      );
      combinations.forEach((combination: Parameter[]) => {
        // ... and one for each combination of optional parameters (+ required)
        result.testCases.push(
          TestsDecorator.createTestCase(
            path,
            method,
            operation,
            [...parameters.required, ...combination],
            hasRequestBody,
            requestBody,
            schema,
          ),
        );
      });
      // Create faulty test cases
      if (hasRequestBody === true) {
        const content = operation.requestBody.content['application/json'];
        if (content.schema) {
          result.testCases.push(...TestsDecorator.createFaultyTestCases(
            path,
            method,
            operation,
            parameters.required,
            schema,
            requestBody,
            content.schema,
          ));
        }
      }
    } else {
      // No parameters
      result.testCases.push(
        this.createTestCase(path, method, operation, [], hasRequestBody, requestBody, schema),
      );
      // Create faulty test cases
      if (hasRequestBody === true) {
        const content = operation.requestBody.content['application/json'];
        if (content.schema) {
          result.testCases.push(...TestsDecorator.createFaultyTestCases(
            path,
            method,
            operation,
            [],
            schema,
            requestBody,
            content.schema,
          ));
        }
      }
    }
    return result;
  }

  /**
   * Get the resolved request body for an operation. Will return either an object or undefined.
   *
   * @param operation
   * @param warnings
   *
   * @returns object|undefined
   */
  protected static getRequestBody(
    operation: OpenAPIOperation,
    warnings: string[],
    ): any {
    let requestBody = undefined;
    if (operation.requestBody) {
      try {
        requestBody = RequestBodyResolver.execute(operation.requestBody);
      } catch (error) {
        warnings.push(error.message);
      }
    }
    return requestBody;
  }

  /**
   * Get the corresponding JSON Schema definition for a path/method.
   *
   * @param schemas
   * @param path
   * @param method
   *
   * @returns JsonSchema
   */
  protected static getJsonSchema(
    schemas: Action[],
    path: string,
    method: Method,
  ): string | undefined {
    const action = schemas.find((action: Action) => {
      return action.$path === path && action.$method === method && action.$operation === 'response';
    });
    if (action) {
      return `${getOperationName(action.$path, action.$method)}.json`;
    }
    return undefined;
  }

  /**
   * Create TestSuite model.
   *
   * @param model
   * @param config
   *
   * @returns ITestSuite
   */
  protected static createTestSuite(
    model: OpenApiSpec,
    config: CommandConfig,
  ): ITestSuite {
    return new TestSuite(
      'CometApiTest',
      TestSuite.parseUrl(config, model),
    );
  }

  /**
   * Get resolved required and optional query parameters.
   *
   * @param operation
   * @param path
   * @param method
   *
   * @returns ParametersObject
   */
  protected static getParameters(
    operation: OpenAPIOperation,
    path: string,
    method: Method,
  ): ParametersObject {
    // Get a list of all inferable parameters
    const requiredParameters: Parameter[] = [];
    const optionalParameters: Parameter[] = [];
    const warnings: string[] = [];
    let hasAllRequiredParameters = true;
    operation.parameters.forEach((apiParameter: OpenAPIParameter) => {
      let parameter: Parameter;
      try {
        parameter = ParameterResolver.execute(apiParameter);
        if (parameter.required) {
          requiredParameters.push(parameter);
        } else {
          optionalParameters.push(parameter);
        }
      } catch (error) {
        if (error.name === 'UnresolvableParameterError') {
          warnings.push(
            `${method.toUpperCase()} ${path}: ${error.message}`,
          );
        }
        if (apiParameter.required || apiParameter.in === 'path') {
          hasAllRequiredParameters = false;
        }
      }
    });

    return {
      hasAllRequiredParameters,
      warnings,
      required: requiredParameters,
      optional: optionalParameters,
    };
  }

  protected static createFaultyTestCases(
    path: string,
    method: Method,
    operation: OpenAPIOperation,
    parameters: Parameter[],
    jsonSchema: string,
    requestBody: any,
    schema: OpenAPISchema,
  ) {
    const testCases = [];
    for (const key of Object.keys(requestBody)) {
      const faultyValues = SchemaValueResolver.resolveFaultyValues(key, schema);
      faultyValues.forEach((faultyValue: FaultyValue) => {
        const bodyCopy = JSON.parse(JSON.stringify(requestBody));
        bodyCopy[key] = faultyValue.value;
        const testCase = new TestCase(method, path);
        testCase.parameters = parameters;
        testCase.hasRequestBody = true;
        testCase.schema = jsonSchema;
        testCase.requestBody = JSON.stringify(bodyCopy);
        let attributeName = camelize(slugify(key));
        attributeName = `${attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}`;
        testCase.name = `${testCase.parseName(operation)}WithFaulty${attributeName}${faultyValue.fault}`;
        testCases.push(testCase);
      });
    }
    return testCases;
  }

  /**
   * Create a TestCase object.
   *
   * @param path
   * @param method
   * @param operation
   * @param parameters
   * @param hasRequestBody
   * @param requestBody
   * @param schema
   *
   * @returns ITestCase
   */
  protected static createTestCase(
    path: string,
    method: Method,
    operation: OpenAPIOperation,
    parameters: Parameter[],
    hasRequestBody: boolean,
    requestBody: any,
    schema: string,
  ): ITestCase {
    const testCase = new TestCase(method, path);
    testCase.parameters = parameters;
    testCase.hasRequestBody = hasRequestBody;
    testCase.schema = schema;
    if (hasRequestBody) {
      testCase.requestBody = JSON.stringify(requestBody);
    }
    testCase.name = testCase.parseName(operation);
    return testCase;
  }
}
