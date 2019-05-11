import { JsonSchema } from '@comet-cli/types';

export interface Action {
  path: string;
  method: string;
  operation: 'request' | 'response';
  name: string;
  schema: JsonSchema;
}
