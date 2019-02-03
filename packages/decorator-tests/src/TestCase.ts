import { Method, TestCase as ITestCase, Parameter } from '../types/tests';
import { OpenAPIOperation } from '@comet-cli/types';
import { getOperationName, slugify, camelize } from '@comet-cli/utils';

export default class TestCase implements ITestCase {
  method: Method;
  name: string;
  parameters: Parameter[];
  hasRequestBody: boolean;
  requestBody: any;
  path: string;
  schema: string;
  isFaulty: boolean;

  constructor(method: Method, path: string) {
    this.method = method;
    this.path = path;
    this.parameters = [];
  }

  /**
   * Parse the operation name, e.g.:
   * `{path: '/users', method: 'GET', parameters: ['filter[email]']}` -> testUsersIndexFilterEmail
   * @param apiOperation
   */
  public parseName(apiOperation: OpenAPIOperation): string {
    // Step 1: Get the operation base name.
    let name = 'Base';
    if (apiOperation.operationId) {
      name = camelize(slugify(apiOperation.operationId));
    } else {
      name = camelize(getOperationName(this.path, this.method));
    }

    // Step 2: Append used parameters
    if (this.parameters.length > 0) {
      name = `${name}With`;
    }
    this.parameters.forEach((parameter: Parameter) => {
      const parameterName = camelize(slugify(parameter.name));
      name = `${name}${parameterName.charAt(0).toUpperCase() + parameterName.slice(1)}`;
    });

    return name;
  }
}
