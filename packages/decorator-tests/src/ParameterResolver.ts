import { OpenAPIParameter } from '@comet-cli/types';
import { Parameter as IParameter } from '../types/tests';
import Parameter from './Parameter';
import UnresolvableParameterError from './UnresolvableParameterError';
import SchemaValueResolver from './SchemaValueResolver';
import undefinedError = Mocha.utils.undefinedError;

export default class ParameterResolver {
  /**
   * Create a parameter and infer its value.
   * @param apiParameter
   * @throws Error
   */
  public static execute(apiParameter: OpenAPIParameter): IParameter {
    const parameter = new Parameter();
    parameter.name = apiParameter.name;
    parameter.location = apiParameter.in;
    parameter.required = apiParameter.required || parameter.location === 'path';
    parameter.value = this.inferValue(apiParameter);
    return parameter;
  }

  /**
   * Infer a parameter's value according to 3 heuristics:
   * 1 - Take example, default or enum value from specification.
   * 2 - If an API request with a random value for the parameter is successful, take that value.
   * 3 - If the specification contains another operation for the same resource, that has
   * a schema definition containing a parameter of the same name, take that value.
   * @param apiParameter
   */
  protected static inferValue(apiParameter: OpenAPIParameter): any {
    let value;

    value = this.inferExampleValue(apiParameter);
    if (value !== undefined) {
      return value;
    }

    value = this.inferDefaultValue(apiParameter);
    if (value !== undefined) {
      return value;
    }

    value = this.inferEnumValue(apiParameter);
    if (value !== undefined) {
      return value;
    }

    throw new UnresolvableParameterError(
      `Could not infer a value for parameter ${apiParameter.name}`,
      apiParameter.name,
    );
  }

  /**
   * Infer a parameter's value from defined example values.
   * These examples can be found in multiple locations.
   * @param apiParameter
   * @throws Error
   */
  protected static inferExampleValue(apiParameter: OpenAPIParameter): any {
    if (apiParameter.hasOwnProperty('example')) {
      return apiParameter.example;
    }

    // Just take the first value
    if (apiParameter.hasOwnProperty('examples')) {
      return apiParameter.examples[Object.keys(apiParameter.examples)[0]].value;
    }

    if (apiParameter.schema) {
      const result = SchemaValueResolver.resolveExampleValue(apiParameter.schema);
      if (result !== undefined) {
        return result;
      }
    }
    // content will always only have 1 key
    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.hasOwnProperty('example')) {
        return content.example;
      }

      if (content.hasOwnProperty('examples')) {
        return content.examples[Object.keys(content.examples)[0]].value;
      }

      if (content.schema) {
        const result = SchemaValueResolver.resolveExampleValue(content.schema);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }

  /**
   * Infer a parameter's value from defined default values.
   * @param apiParameter
   */
  protected static inferDefaultValue(apiParameter: OpenAPIParameter): any {
    if (apiParameter.schema) {
      const result = SchemaValueResolver.resolveDefaultValue(apiParameter.schema);
      if (result !== undefined) {
        return result;
      }
    }

    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.schema) {
        const result = SchemaValueResolver.resolveDefaultValue(content.schema);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }

  /**
   * Infer a parameter's value from defined enum values (take first).
   * @param apiParameter
   */
  protected static inferEnumValue(apiParameter: OpenAPIParameter): any {
    if (apiParameter.schema) {
      const result = SchemaValueResolver.resolveEnumValue(apiParameter.schema);
      if (result !== undefined) {
        return result;
      }
    }

    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.schema) {
        const result = SchemaValueResolver.resolveEnumValue(content.schema);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }
}