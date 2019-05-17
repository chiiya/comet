import { ApiModel, Authentication } from '@comet-cli/types';
import { PostmanVariable } from '../../types';
import { ucfirst } from '@comet-cli/helper-utils';
const uuidv4 = require('uuid/v4');

/**
 * Create Postman Collection variables for data that is reused a lot.
 * @param model
 */
export const transformVariables = (model: ApiModel): PostmanVariable[] => {
  const variables: PostmanVariable[] = [];
  variables.push(...createServerVariables(model));
  variables.push(...createAuthVariables(model));

  return variables;
};

/**
 * We can have multiple server configurations for our API, so we will add each
 * configuration as a variable, and then create a base URL variable that will just
 * be set to the first configuration entry. That way the user can easily switch
 * between URLs by just changing one value.
 * @param model
 */
const createServerVariables = (model: ApiModel): PostmanVariable[] => {
  const variables: PostmanVariable[] = [];
  // Add base URL
  if (model.info.servers.length > 0) {
    variables.push({
      id: uuidv4(),
      key: 'url',
      value: '{{url_0}}',
      type: 'string',
      name: 'Server Base URL',
      description: 'Request base URL',
    });
  }
  // Add configured URLs as variables
  for (const [index, server] of (model.info.servers || []).entries()) {
    let uri = server.uri;
    // Replace variables with a default or enum value, if possible.
    if (server.variables) {
      for (const name of Object.keys(server.variables)) {
        const variable = server.variables[name];
        if (variable.default !== undefined) {
          uri = uri.replace(`{${name}}`, variable.default);
        } else if (variable.enum && variable.enum.length > 0) {
          uri = uri.replace(`{${name}}`, variable.enum[0]);
        }
      }
    }
    variables.push({
      id: uuidv4(),
      key: `url_${index}`,
      value: uri,
      type: 'string',
      name: `Server URL ${index}`,
      description: server.description,
    });
  }

  return variables;
};

/**
 * Create variables for each auth secret.
 * @param model
 */
export const createAuthVariables = (model: ApiModel): PostmanVariable[] => {
  const variables: PostmanVariable[] = [];
  if (model.auth === undefined) {
    return variables;
  }
  for (const name of Object.keys(model.auth)) {
    const scheme = model.auth[name];
    if (scheme.type === 'basic' || scheme.type === 'digest') {
      variables.push({
        key: `auth_${scheme.type}_username`,
        description: scheme.description || `Username for HTTP ${ucfirst(scheme.type)} Auth`,
        type: 'string',
        name: `HTTP ${ucfirst(scheme.type)} Username`,
      });
      variables.push({
        key: `auth_${scheme.type}_password`,
        description: scheme.description || `Password for HTTP ${ucfirst(scheme.type)} Auth`,
        type: 'string',
        name: `HTTP ${ucfirst(scheme.type)} Password`,
      });
    } else {
      variables.push({
        key: `auth_${name}`,
        description: scheme.description || `Auth secret for ${ucfirst(scheme.type)}`,
        type: 'string',
        name: `${scheme.type.toUpperCase()} Auth Secret`,
      });
    }
  }
  return variables;
};
