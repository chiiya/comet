import { ApiBlueprintExample } from '../../types/blueprint';
import { Transaction } from '@comet-cli/types';
import RequestTransformer from './RequestTransformer';
import ResponseTransformer from './ResponseTransformer';

export default class TransactionTransformer {
  /**
   * Parse AST transaction examples.
   * @param examples
   */
  public static execute(examples: ApiBlueprintExample[]): Transaction[] {
    if (examples.length === 0) {
      return [];
    }
    const transactions = [];
    for (const example of examples) {
      const transaction: Transaction = {
        request: undefined,
        responses: {},
      };
      if (example.requests && example.requests.length > 0) {
        transaction.request = RequestTransformer.execute(example.requests);
      }
      if (example.responses && example.responses.length > 0) {
        transaction.responses = ResponseTransformer.execute(example.responses);
      }
      transactions.push(transaction);
    }

    return transactions;
  }
}
