import { Parameter } from '@comet-cli/types';
import { camelize, slugify, getOperationName, EnhancedOperation } from '@comet-cli/helper-utils';

/**
 * Parse the operation name, e.g.:
 * `{path: '/users', method: 'GET', parameters: ['filter[email]']}` -> UsersIndexFilterEmail
 * @param operation
 * @param parameters
 */
export const buildTestCaseName = (
  operation: EnhancedOperation,
  parameters: Parameter[],
): string => {
  // Step 1: Get the operation base name.
  let name = 'Base';
  if (operation.name) {
    name = camelize(slugify(operation.name));
  } else {
    name = camelize(getOperationName(operation.uri, operation.method));
  }

  // Step 2: Append used parameters
  const queryParameters = parameters.filter(item => item.location !== 'path');
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
 * Get the full url with resolved path and query parameters.
 * @param baseUrl
 * @param path
 * @param parameters
 */
export const getResolvedUrl = (baseUrl: string, path: string, parameters: Parameter[]): string => {
  let url = path;
  let hasAddedQueryParameter = false;
  parameters.forEach((parameter: Parameter) => {
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
};
