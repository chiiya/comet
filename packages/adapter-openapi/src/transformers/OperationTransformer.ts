import Specification from '../Specification';
import { OpenAPIOperation } from '../../types/open-api';
import { Header, Operation } from '@comet-cli/types';
import HeaderTransformer from './HeaderTransformer';
import ParameterTransformer from './ParameterTransformer';
import RequestTransformer from './RequestTransformer';
import ResponseTransformer from './ResponseTransformer';

export default class OperationTransformer {
  public static execute(
    spec: Specification,
    operation: OpenAPIOperation,
    method: string,
    resourceHeaders: Header[],
  ): Operation {
    const params = operation.parameters || [];
    // Overwrite resource headers with operation headers.
    const operationHeaders = HeaderTransformer.transformFromParameters(spec, params);
    const headers = this.mergeHeaders(resourceHeaders, operationHeaders);

    let description = operation.description || operation.summary || '';
    if (operation.externalDocs) {
      description = `[${operation.externalDocs.description}](${operation.externalDocs.url})\n\n${description}`;
    }
    return {
      method,
      name: operation.operationId || null,
      description: description || null,
      deprecated: operation.deprecated || false,
      tags: operation.tags,
      parameters: ParameterTransformer.execute(spec, params),
      securedBy: operation.security,
      request: RequestTransformer.execute(spec, operation.requestBody, headers),
      responses: ResponseTransformer.execute(spec, operation.responses),
      transactions: [],
    };
  }

  /**
   * Overwrite resource headers with operation headers, if specified.
   * @param resourceHeaders
   * @param operationHeaders
   */
  protected static mergeHeaders(resourceHeaders: Header[], operationHeaders: Header[]): Header[] {
    const mergedHeaders = {};
    for (const header of resourceHeaders) {
      mergedHeaders[header.key] = header;
    }
    for (const header of operationHeaders) {
      mergedHeaders[header.key] = header;
    }
    const headers = [];
    for (const header of Object.keys(mergedHeaders)) {
      headers.push(mergedHeaders[header]);
    }

    return headers;
  }
}
