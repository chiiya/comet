import { ApiModel, Authentication } from '@comet-cli/types';
import { PostmanVariable } from '../../types';
const uuidv4 = require('uuid/v4');

export const transformVariables = (model: ApiModel): PostmanVariable[] => {
  const variables: PostmanVariable[] = [];
  variables.push(...createServerVariables(model));

  // Add auth secrets as variables
  if (model.auth) {
    for (const name of Object.keys(model.auth)) {
      const scheme = model.auth[name];
      variables.push(getAuthSecret(scheme));
    }
  }
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

export const getAuthSecret = (auth: Authentication): PostmanVariable => {
  return {
    id: uuidv4(),
    key: `auth_${auth.type}`,
    description: auth.description,
    type: 'string',
    name: `Auth secret for ${auth.type.toUpperCase()}`,
  };
};
