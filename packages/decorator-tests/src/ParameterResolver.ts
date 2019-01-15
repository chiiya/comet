import { OpenAPIParameter } from '@comet-cli/types';
import { Parameter as IParameter } from '../types/tests';
import Parameter from './Parameter';
import UnresolvableParameterError from './UnresolvableParameterError';

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
    if (value) {
      return value;
    }

    value = this.inferDefaultValue(apiParameter);
    if (value) {
      return value;
    }

    value = this.inferEnumValue(apiParameter);
    if (value) {
      return value;
    }
  }

  /**
   * Infer a parameter's value from defined example values.
   * These examples can be found in multiple locations.
   * @param apiParameter
   * @throws Error
   */
  protected static inferExampleValue(apiParameter: OpenAPIParameter) {
    if (apiParameter.example) {
      return apiParameter.example;
    }

    // Just take the first value
    if (apiParameter.examples) {
      return apiParameter.examples[Object.keys(apiParameter.examples)[0]].value;
    }

    if (apiParameter.schema && apiParameter.schema.example) {
      return apiParameter.schema.example;
    }

    // content will always only have 1 key
    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.example) {
        return content.example;
      }
      if (content.examples) {
        return content.examples[Object.keys(apiParameter.examples)[0]].value;
      }
      if (content.schema && content.schema.example) {
        return content.schema.example;
      }
    }

    throw new UnresolvableParameterError(
      `Could not infer a value for parameter ${apiParameter.name}`,
      apiParameter.name,
    );
  }

  /**
   * Infer a parameter's value from defined default values.
   * @param apiParameter
   */
  protected static inferDefaultValue(apiParameter: OpenAPIParameter) {
    if (apiParameter.schema && apiParameter.schema.default) {
      return apiParameter.schema.default;
    }

    if (apiParameter.schema && apiParameter.schema.items && apiParameter.schema.items.default) {
      return apiParameter.schema.items.default;
    }

    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.schema && content.schema.default) {
        return content.schema.default;
      }

      if (content.schema && content.schema.items && content.schema.items.default) {
        return content.schema.items.default;
      }
    }
  }

  /**
   * Infer a parameter's value from defined enum values (take first).
   * @param apiParameter
   */
  protected static inferEnumValue(apiParameter: OpenAPIParameter) {
    if (apiParameter.schema && apiParameter.schema.enum) {
      return apiParameter.schema.enum[0];
    }

    if (apiParameter.schema && apiParameter.schema.items && apiParameter.schema.items.enum) {
      return apiParameter.schema.items.enum[0];
    }

    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.schema && content.schema.enum) {
        return content.schema.enum[0];
      }

      if (content.schema && content.schema.items && content.schema.items.enum) {
        return content.schema.items.enum[0];
      }
    }
  }
}
