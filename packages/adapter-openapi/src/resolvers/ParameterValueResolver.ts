import SchemaValueResolver from './SchemaValueResolver';
import { OpenAPIHeader, OpenAPIParameter } from '../../types/open-api';
import Specification from '../Specification';
import SchemaTransformer from '../transformers/SchemaTransformer';
import { Schema } from '@comet-cli/types';

export default class ParameterValueResolver {
  /**
   * Infer a parameter's value according to 3 heuristics:
   * 1 - Take example, default or enum value from specification.
   * 2 - If an API request with a random value for the parameter is successful, take that value.
   * 3 - If the specification contains another operation for the same resource, that has
   * a schema definition containing a parameter of the same name, take that value.
   * @param spec
   * @param apiParameter
   */
  public static inferValue(spec: Specification, apiParameter: OpenAPIParameter | OpenAPIHeader): any {
    let value;
    const parameter = spec.deref(apiParameter);
    spec.exitRef(apiParameter);

    value = this.inferExampleValue(spec, parameter);
    if (value !== undefined) {
      return value;
    }

    value = this.inferDefaultValue(spec, parameter);
    if (value !== undefined) {
      return value;
    }

    value = this.inferEnumValue(spec, parameter);
    if (value !== undefined) {
      return value;
    }

    return undefined;
  }

  /**
   * Infer a parameter's value from defined example values.
   * These examples can be found in multiple locations.
   * @param spec
   * @param apiParameter
   * @throws Error
   */
  protected static inferExampleValue(spec: Specification, apiParameter: OpenAPIParameter | OpenAPIHeader): any {
    if (apiParameter.hasOwnProperty('example')) {
      return apiParameter.example;
    }

    // Take a random value from examples
    if (apiParameter.hasOwnProperty('examples') && apiParameter.examples) {
      const examples = Object.keys(apiParameter.examples);
      const index = Math.floor(Math.random() * examples.length);
      const example = spec.deref(apiParameter.examples[index]);
      spec.exitRef(apiParameter.examples[index]);
      return example.value;
    }

    if (apiParameter.schema) {
      const schema = SchemaTransformer.execute(spec, apiParameter.schema);
      const result = SchemaValueResolver.resolveExampleValue(schema);
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
        // return content.examples[Object.keys(content.examples)[0]].value;
      }

      if (content.schema) {
        const schema = SchemaTransformer.execute(spec, content.schema);
        const result = SchemaValueResolver.resolveExampleValue(schema);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }

  /**
   * Infer a parameter's value from defined default values.
   * @param spec
   * @param apiParameter
   */
  protected static inferDefaultValue(spec: Specification, apiParameter: OpenAPIParameter | OpenAPIHeader): any {
    if (apiParameter.schema) {
      const schema = SchemaTransformer.execute(spec, apiParameter.schema);
      const result = SchemaValueResolver.resolveDefaultValue(schema);
      if (result !== undefined) {
        return result;
      }
    }

    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.schema) {
        const schema = SchemaTransformer.execute(spec, content.schema);
        const result = SchemaValueResolver.resolveDefaultValue(schema);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }

  /**
   * Infer a parameter's value from defined enum values (take random).
   * @param spec
   * @param apiParameter
   */
  protected static inferEnumValue(spec: Specification, apiParameter: OpenAPIParameter | OpenAPIHeader): any {
    if (apiParameter.schema) {
      const schema = SchemaTransformer.execute(spec, apiParameter.schema);
      const result = SchemaValueResolver.resolveEnumValue(schema);
      if (result !== undefined) {
        return result;
      }
    }

    if (apiParameter.content) {
      const content = apiParameter.content[Object.keys(apiParameter.content)[0]];
      if (content.schema) {
        const schema = SchemaTransformer.execute(spec, content.schema);
        const result = SchemaValueResolver.resolveEnumValue(schema);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }
}
