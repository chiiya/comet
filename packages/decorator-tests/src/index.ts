import { CommandConfig, Decorator, OpenAPIOperation, OpenApiSpec } from '@comet-cli/types';
import { OpenApiSpecJsonDecorated } from '@comet-cli/decorator-json-schemas/types/json-schema';
import { Method, Operation, Parameter, TestSuite } from '../types/tests';
import { getOperationName } from '@comet-cli/utils';

export default class TestsDecorator implements Decorator {
  execute(model: OpenApiSpec & OpenApiSpecJsonDecorated, config: CommandConfig): any {
    const operations = [];
    const testSuite = this.createTestSuite(model, config);
    Object.keys(model.paths).forEach((path) => {
      const methods: Method[] = ['get', 'put', 'post', 'patch', 'delete', 'options', 'head', 'trace'];
      methods.forEach((method: Method) => {
        const operation = model.paths[path][method];
        if (operation) {
          testSuite.operations.push(this.createTestOperation(path, method, operation));
        }
      });
    });

    model.decorated.testOperations = operations;
    return model;
  }

  protected createTestSuite(model: OpenApiSpec, config: CommandConfig): TestSuite {
    const testSuite = <TestSuite>{
      name: 'ApiTest',
      operations: [],
    };
    // Take base url from either config or the server configuration.
    if (config.base_url) {
      testSuite.url = config.base_url;
    } else if (model.servers && model.servers.length > 0) {
      testSuite.url = model.servers[0].url;
    }
    return testSuite;
  }

  protected createTestOperation(path: string, method: Method, operation: OpenAPIOperation): Operation {
    const op = <Operation>{
      path,
      method,
    };
    if (operation.operationId) {
      op.name = `${operation.operationId}Test`;
    } else {
      const operationName = getOperationName(path, method)
        .replace(
          /-([a-z])/gi,
          (match: string) => match[1].toUpperCase(),
        );
      op.name = `${operationName}Test`;
    }
    return op;
  }

  protected createTestParameters(operation: OpenAPIOperation): Parameter[] {
    const parameters: Parameter[] = [];
    return parameters;
  }
}
