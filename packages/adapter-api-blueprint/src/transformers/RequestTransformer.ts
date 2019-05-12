import { ApiBlueprintExample, ApiBlueprintRequest } from '../../types/blueprint';
import { Request } from '@comet-cli/types';
import HeaderTransformer from './HeaderTransformer';

export default class RequestTransformer {
  /**
   * Parse AST requests.
   * @param requests
   */
  public static execute(requests: ApiBlueprintRequest[]): Request {
    // Iterate over the requests, group them by media-type and extract all the headers
    const request: Request = {
      description: null,
      headers: [],
      body: {},
    };
    // If there is only one example request and it has a description, take that one.
    if (requests.length === 1 && requests[0].description) {
      request.description = requests[0].description;
    }
    const foundHeaders = {};
    for (const exampleRequest of requests) {
      const headers = HeaderTransformer.execute(exampleRequest.headers);
      for (const header of headers) {
        if (foundHeaders[header.name]) {
          continue;
        }
        foundHeaders[header.name] = true;
        request.headers.push(header);
      }
      const contentType = headers.find(header => header.name === 'Content-Type');
      const mediaType = contentType !== undefined ? contentType.example : null;
      if (mediaType !== null) {
        if (request.body[mediaType]) {
          request.body[mediaType].examples.push(exampleRequest.body);
        } else {
          request.body[mediaType] = {
            mediaType,
            schema: exampleRequest.schema !== '' ? JSON.parse(exampleRequest.schema) : null,
            examples: exampleRequest.body ? [exampleRequest.body] : [],
          };
        }
      }
    }

    return request;
  }

  /**
   * Get a request object from all transaction examples.
   * @param examples
   */
  public static transformFromExamples(examples: ApiBlueprintExample[]): Request {
    if (examples.length === 0) {
      return null;
    }

    // First, get an array of _all_ example requests (from all transactions).
    const exampleRequests: ApiBlueprintRequest[] = [];
    for (const example of examples) {
      if (example.requests && example.requests.length > 0) {
        exampleRequests.push(...example.requests);
      }
    }

    // Then, build the request from those examples
    return this.execute(exampleRequests);
  }
}
