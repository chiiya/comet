import {
  CommandConfig,
  Decorator,
  OpenAPIOperation,
  OpenAPIParameter,
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

export default class TestsDecorator implements Decorator {
  execute(model: OpenApiSpec & OpenApiSpecJsonDecorated, config: CommandConfig): any {
    const testSuite = TestsDecorator.createTestSuite(model, config);
    Object.keys(model.paths).forEach((path) => {
      const methods: Method[] = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      methods.forEach((method: Method) => {
        const operation = model.paths[path][method];
        if (operation) {
          if (operation.parameters) {
            const parameters = this.getParameters(operation);
            if (parameters.hasAllRequiredParameters === false) {
              return;
            }
            const combinations = Combination.combinations(parameters.optional);
            // Create one test case with just the required parameters...
            testSuite.testCases.push(
              this.createTestCase(path, method, operation, parameters.required),
            );
            combinations.forEach((combination: Parameter[]) => {
              // ... and one for each combination of optional parameters (+ required)
              testSuite.testCases.push(
                this.createTestCase(path, method, operation, [...parameters.required, ...combination]),
              );
            });
          } else {
            testSuite.testCases.push(
              this.createTestCase(path, method, operation, []),
            );
          }
        }
      });
    });

    model.decorated.testSuite = testSuite;
    return model;
  }

  protected static createTestSuite(model: OpenApiSpec, config: CommandConfig): ITestSuite {
    return new TestSuite(
      'CometApiTest',
      TestSuite.parseUrl(config, model),
    );
  }

  protected getParameters(operation: OpenAPIOperation): ParametersObject {
    // Get a list of all inferable parameters
    const requiredParameters: Parameter[] = [];
    const optionalParameters: Parameter[] = [];
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
        console.warn(error.message);
        if (apiParameter.required || apiParameter.in === 'path') {
          hasAllRequiredParameters = false;
        }
      }
    });

    return {
      hasAllRequiredParameters,
      required: requiredParameters,
      optional: optionalParameters,
    };
  }

  protected createTestCase(
    path: string,
    method: Method,
    operation: OpenAPIOperation,
    parameters: Parameter[],
  ): ITestCase {
    const testCase = new TestCase(method, path);
    testCase.parameters = parameters;
    testCase.parseName(operation);
    return testCase;
  }
}
