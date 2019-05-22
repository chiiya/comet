import {
  EnhancedOperation,
  getOperationName,
  prettifyOperationName,
} from '@comet-cli/helper-utils';
import { NavOperation } from '../types/api';

export default class NavOperationTransformer {
  public static execute(operation: EnhancedOperation): NavOperation {
    return {
      name: operation.name || prettifyOperationName(operation.uri, operation.method),
      method: operation.method,
      link: getOperationName(operation.uri, operation.method),
    };
  }
}
