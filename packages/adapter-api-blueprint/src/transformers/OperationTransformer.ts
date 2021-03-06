import { ApiBlueprintAction } from '../../types/blueprint';
import { Authentication, Dict, Operation, Parameter, Transaction } from '@comet-cli/types';
import ParameterTransformer from './ParameterTransformer';
import TransactionTransformer from './TransactionTransformer';
import RequestTransformer from './RequestTransformer';
import ResponseTransformer from './ResponseTransformer';
const _ = require('lodash');

export default class OperationTransformer {
  /**
   * Parse an API operation from an API Blueprint action definition.
   * @param resourceUri
   * @param action
   * @param auth
   */
  public static execute(resourceUri: string, action: ApiBlueprintAction, auth: Authentication | undefined): Operation {
    const uri = _.get(action, 'attributes.uriTemplate', resourceUri);
    const parsedTransactions = TransactionTransformer.execute(action.examples);
    const parsedParameters = ParameterTransformer.execute(uri, action.parameters);
    const securedBy = this.getSecuredByFromRequestHeadersOrParameters(parsedTransactions, parsedParameters, auth);
    return {
      name: action.name,
      method: action.method,
      description: action.description || undefined,
      parameters: parsedParameters,
      request: RequestTransformer.transformFromExamples(action.examples),
      responses: ResponseTransformer.transformFromExamples(action.examples),
      transactions: parsedTransactions,
      deprecated: false,
      securedBy: securedBy !== undefined ? [securedBy] : [],
    };
  }

  /**
   * Check whether a request applies any of the specified authentication headers or parameters.
   * If so, we can assume that it is protected by that auth strategy.
   * @param transactions
   * @param parameters
   * @param auth
   */
  protected static getSecuredByFromRequestHeadersOrParameters(
    transactions: Transaction[],
    parameters: Parameter[],
    auth: Authentication | undefined,
  ): Dict<string[]> | undefined {
    if (auth === undefined || auth.type === undefined) {
      return undefined;
    }
    // Handle case where auth key / token is passed via query parameter
    if (auth.location === 'query') {
      return parameters.find(item => item.name === auth.name) !== undefined ? { default: [] } : undefined;
    }
    // Handle case where auth key / token is passed via HTTP header
    let header: string | undefined;
    switch (auth.type) {
      case 'basic':
      case 'digest':
      case 'jwt':
      case 'oauth2':
        header = 'Authorization';
        break;
      case 'key':
        header = auth.name;
        break;
    }
    const headers = [];
    for (const transaction of transactions) {
      // Only check for auth headers when transaction has successful responses.
      if (transaction.request && this.transactionHasSuccessfulResponse(transaction)) {
        headers.push(...transaction.request.headers);
      }
    }
    return headers.find(item => item.name === header) !== undefined ? { default: [] } : undefined;
  }

  /**
   * Check whether a transaction has at least one successful response.
   * @param transaction
   */
  protected static transactionHasSuccessfulResponse(transaction: Transaction): boolean {
    for (const code of Object.keys(transaction.responses || {})) {
      if (code.startsWith('1') || code.startsWith('2') || code.startsWith('3')) {
        return true;
      }
    }

    return false;
  }
}
