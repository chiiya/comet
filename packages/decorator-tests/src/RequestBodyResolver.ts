import { OpenAPIRequestBody, OpenAPISchema } from '@comet-cli/types';
import SchemaValueResolver from './SchemaValueResolver';

export default class RequestBodyResolver {
  /**
   * Create a request body and infer its attribute values.
   * @param requestBody
   * @throws Error
   * @throws UnresolvableParameterError
   */
  public static execute(requestBody: OpenAPIRequestBody): any {
    if (requestBody.content.hasOwnProperty('application/json') === false) {
      throw new Error('Only application/json request bodies are supported at this time.');
    }
    const content = requestBody.content['application/json'];
    if (content.hasOwnProperty('example')) {
      return content.example;
    }
    if (content.examples) {
      return content.examples[Object.keys(content.examples)[0]].value;
    }
    if (content.schema) {
      const result = SchemaValueResolver.execute(content.schema);
      if (result !== undefined) {
        return result;
      }
    }

    return undefined;
  }
}
