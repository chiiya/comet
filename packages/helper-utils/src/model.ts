import {
  ApiModel,
  Bodies,
  Body,
  Dict,
  Operation,
  Parameter,
  Resource, Schema,
  Server,
} from '@comet-cli/types';

/**
 * Get an array of all API resources.
 * @param model
 */
export const getAllResources = (model: ApiModel): Resource[] => {
  const resources: Resource[] = [...model.resources];
  for (const group of model.groups) {
    resources.push(...group.resources);
  }

  return resources;
};

export const getResolvedServerUrl = (server: Server): string => {
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
  uri = uri.replace(/^\/\//, 'http://');

  return uri;
};

export const getJsonBody = (bodies: Bodies): Body | undefined => {
  const types = Object.keys(bodies);
  const jsonType = types.find(type => type.includes('json'));
  if (jsonType !== undefined) {
    return bodies[jsonType];
  }
};

export const getOperationParameters = (resource: Resource, operation: Operation): Parameter[] => {
  const parameters: Dict<Parameter> = {};
  for (const param of resource.parameters) {
    parameters[`${param.location}-${param.name}`] = param;
  }
  for (const param of operation.parameters) {
    parameters[`${param.location}-${param.name}`] = param;
  }
  return Object.values(parameters);
};

export const getHumanReadableType = (schema?: Schema): string | undefined => {
  if (schema === undefined || schema.type === undefined) {
    return undefined;
  }
  const type = schema.type;
  if (isPrimitiveType(schema)) {
    if (Array.isArray(type)) {
      return type.join(' | ');
    }
    return type;
  }
  if (schema.anyOf !== undefined) {
    return schema.anyOf.map(schema => getHumanReadableType(schema)).join(' | ');
  }
  if (schema.oneOf !== undefined) {
    return schema.oneOf.map(schema => getHumanReadableType(schema)).join(' | ');
  }
  if (type === 'array' && schema.items && schema.items.type) {
    const subType = getHumanReadableType(schema.items);
    return `Array of ${subType}${subType && !subType.endsWith('s') ? 's' : ''}`;
  }
  if (type === 'object') {
    return type;
  }
  if (schema.enum !== undefined && schema.enum.length > 0) {
    if (Array.isArray(type)) {
      return `Enum of ${type.join(' | ')}`;
    }
    return `Enum of ${type}s`;
  }

  return Array.isArray(type) ? type.join(' | ') : type;
};

export const resolveExampleUri = (
  uri: string,
  parameters: Parameter[],
): string => {
  let url = uri;
  const foundParams: Dict<Parameter> = {};
  for (const param of parameters) {
    if (param.location === 'path') {
      foundParams[param.name] = param;
    }
  }
  for (const name of Object.keys(foundParams)) {
    const param = foundParams[name];
    const regex = new RegExp(`{${name}}`, 'gi');
    if (param.example !== undefined) {
      url = url.replace(regex, param.example);
    } else {
      url = url.replace(regex, ':$1');
    }
  }

  return url;
};

export const isPrimitiveType = (schema: Schema) => {
  if (schema.oneOf !== undefined || schema.anyOf !== undefined) {
    return false;
  }

  if (Array.isArray(schema.type)) {
    const types = schema.type;
    let isPrimitive = true;
    for (const type of types) {
      if (type === 'object') {
        isPrimitive = schema.properties !== undefined
          ? Object.keys(schema.properties).length === 0
          : schema.additionalProperties === undefined;
      }
      if (type === 'array') {
        isPrimitive = schema.items === undefined;
      }
      if (schema.enum && schema.enum.length > 0) {
        return false;
      }
    }
    return isPrimitive;
  }

  if (schema.type === 'object') {
    return schema.properties !== undefined
      ? Object.keys(schema.properties).length === 0
      : schema.additionalProperties === undefined;
  }

  if (schema.type === 'array') {
    return schema.items === undefined;
  }

  if (schema.enum && schema.enum.length > 0) {
    return false;
  }

  return true;
};
