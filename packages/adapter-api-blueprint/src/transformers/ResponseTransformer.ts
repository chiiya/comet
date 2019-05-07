import { ApiBlueprintResponse } from '../../types/blueprint';
import { Responses } from '@comet-cli/types';
import HeaderTransformer from './HeaderTransformer';

export default class ResponseTransformer {
  /**
   * Parse AST responses.
   * @param exampleResponses
   */
  public static execute(exampleResponses: ApiBlueprintResponse[]): Responses {
    // Iterate over the responses, group them by status code and media-type and extract all the headers
    const responses: Responses = {};
    const foundHeaders: { [code: string]: any } = {};
    for (const exampleResponse of exampleResponses) {
      const statusCode = exampleResponse.name;
      // Create response if it does not exist yet
      if (responses[statusCode] === undefined) {
        responses[statusCode] = {
          statusCode: Number(statusCode),
          headers: [],
          body: {},
          description: exampleResponse.description || null,
        };
      }
      if (foundHeaders[statusCode] === undefined) {
        foundHeaders[statusCode] = {};
      }
      const headers = HeaderTransformer.execute(exampleResponse.headers);
      for (const header of headers) {
        if (header.key === 'Content-Type' || foundHeaders[statusCode][header.key]) {
          continue;
        }
        foundHeaders[statusCode][header.key] = true;
        responses[statusCode].headers.push(header);
      }

      const contentType = headers.find(header => header.key === 'Content-Type');
      const mediaType = contentType !== undefined ? contentType.example : null;
      if (mediaType !== null) {
        if (responses[statusCode].body[mediaType]) {
          responses[statusCode].body[mediaType].examples.push(exampleResponse.body);
        } else {
          responses[statusCode].body[mediaType] = {
            mediaType,
            schema: exampleResponse.schema !== '' ? JSON.parse(exampleResponse.schema) : null,
            examples: exampleResponse.body ? [exampleResponse.body] : [],
          };
        }
      }
    }

    return responses;
  }
}
