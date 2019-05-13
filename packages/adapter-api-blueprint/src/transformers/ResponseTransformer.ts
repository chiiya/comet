import { ApiBlueprintExample, ApiBlueprintResponse } from '../../types/blueprint';
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
          description: exampleResponse.description || undefined,
        };
      }
      if (foundHeaders[statusCode] === undefined) {
        foundHeaders[statusCode] = {};
      }
      const headers = HeaderTransformer.execute(exampleResponse.headers);
      for (const header of headers) {
        if (header.name === 'Content-Type' || foundHeaders[statusCode][header.name]) {
          continue;
        }
        foundHeaders[statusCode][header.name] = true;
        responses[statusCode].headers.push(header);
      }

      const contentType = headers.find(header => header.name === 'Content-Type');
      const mediaType = contentType !== undefined ? contentType.example : null;
      if (mediaType !== null) {
        // @ts-ignore
        if (responses[statusCode].body[mediaType]) {
          // @ts-ignore
          responses[statusCode].body[mediaType].examples.push(exampleResponse.body);
        } else {
          // @ts-ignore
          responses[statusCode].body[mediaType] = {
            mediaType,
            schema: exampleResponse.schema !== '' ? JSON.parse(exampleResponse.schema) : undefined,
            examples: exampleResponse.body ? [exampleResponse.body] : [],
          };
        }
      }
    }

    return responses;
  }

  /**
   * Get a responses object from all transaction examples.
   * @param examples
   */
  public static transformFromExamples(examples: ApiBlueprintExample[]): Responses {
    if (examples.length === 0) {
      return {};
    }

    // First, get an array of all example responses.
    const exampleResponses: ApiBlueprintResponse[] = [];
    for (const example of examples) {
      if (example.responses && example.responses.length > 0) {
        exampleResponses.push(...example.responses);
      }
    }

    // Then, build the responses from those examples
    return this.execute(exampleResponses);
  }
}
