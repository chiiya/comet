import { ApiModel, CommandConfig, Operation } from '@comet-cli/types';
import { camelize, slugify, getOperationName } from '@comet-cli/helper-utils';
import { TestCase } from '../types';

/**
 * Parse the operation name, e.g.:
 * `{path: '/users', method: 'GET', parameters: ['filter[email]']}` -> testUsersIndexFilterEmail
 * @param testCase
 * @param operation
 */
export const parseTestCaseName = (testCase: TestCase, operation: Operation): string => {
  // Step 1: Get the operation base name.
  let name = 'Base';
  if (operation.name) {
    name = camelize(slugify(operation.name));
  } else {
    name = camelize(getOperationName(testCase.path, testCase.method));
  }

  // Step 2: Append used parameters
  const queryParameters = testCase.parameters.filter(item => item.location !== 'path');
  if (queryParameters.length > 0) {
    name = `${name}With`;
  }
  for (const param of queryParameters) {
    const parameterName = camelize(slugify(param.name));
    name = `${name}${parameterName.charAt(0).toUpperCase() + parameterName.slice(1)}and`;
  }

  // Remove last 'and'
  if (queryParameters.length > 0) {
    name = name.slice(0, -3);
  }

  return name;
};

/**
 * Parse the API base URL from config or the specification.
 *
 * @param config
 * @param model
 *
 * @throws Error
 */
export const parseUrl = (config: CommandConfig, model: ApiModel) => {
  if (config.base_url) {
    return config.base_url;
  }
  if (model.servers && model.servers.length > 0) {
    return model.servers[0].url;
  }
  throw new Error(
    'No API base URL configuration found. Did you set a value for `base_url` in your config?',
  );
};
