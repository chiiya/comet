import {
  CommandConfig,
  Decorator,
  OpenAPIOperation,
  OpenAPIParameter, OpenAPIRequestBody,
  OpenApiSpec,
} from '@comet-cli/types';
import { OpenApiSpecJsonDecorated } from '@comet-cli/decorator-json-schemas/types/json-schema';
import {
  Method,
  TestCase as ITestCase,
  Parameter,
  ParametersObject,
  TestSuite as ITestSuite,
} from '../types/tests';
import TestSuite from './TestSuite';
import ParameterResolver from './ParameterResolver';
import Combination from './Combination';
import TestCase from './TestCase';
import RequestBodyResolver from './RequestBodyResolver';

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
    Object.keys(model.paths).forEach((path) => {
      const methods: Method[] = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      methods.forEach((method: Method) => {
        const operation = model.paths[path][method];
        if (operation) {
          let hasRequestBody = false;
          let requestBody;
          if (operation.requestBody) {
            try {
              requestBody = RequestBodyResolver.execute(operation.requestBody);
              hasRequestBody = true;
            } catch (error) {
              warnings.push(error.message);
              return;
            }
          }
          if (operation.parameters) {
            const parameters = this.getParameters(operation, path, method);
            warnings.push(...parameters.warnings);
            if (parameters.hasAllRequiredParameters === false) {
              return;
            }
            const combinations = Combination.combinations(parameters.optional);
            // Create one test case with just the required parameters...
            testSuite.testCases.push(
              this.createTestCase(path, method, operation, parameters.required, hasRequestBody, requestBody),
            );
            combinations.forEach((combination: Parameter[]) => {
              // ... and one for each combination of optional parameters (+ required)
              testSuite.testCases.push(
                this.createTestCase(
                  path,
                  method,
                  operation,
                  [...parameters.required, ...combination],
                  hasRequestBody,
                  requestBody,
                ),
              );
            });
          } else {
            testSuite.testCases.push(
              this.createTestCase(path, method, operation, [], hasRequestBody, requestBody),
            );
          }
        }
      });
    });

    model.decorated.testSuite = testSuite;
    return Promise.resolve(warnings);
  }

  protected static createTestSuite(model: OpenApiSpec, config: CommandConfig): ITestSuite {
    return new TestSuite(
      'CometApiTest',
      TestSuite.parseUrl(config, model),
    );
  }

  protected getParameters(operation: OpenAPIOperation, path: string, method: Method): ParametersObject {
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

  protected createTestCase(
    path: string,
    method: Method,
    operation: OpenAPIOperation,
    parameters: Parameter[],
    hasRequestBody: boolean,
    requestBody: any,
  ): ITestCase {
    const testCase = new TestCase(method, path);
    testCase.parameters = parameters;
    testCase.hasRequestBody = hasRequestBody;
    if (hasRequestBody) {
      testCase.requestBody = JSON.stringify(requestBody);
    }
    testCase.parseName(operation);
    return testCase;
  }
}
