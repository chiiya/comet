import { Parameter as IParameter } from '../types/tests';
import { OpenAPIParameterLocation } from '@comet-cli/types';

export default class Parameter implements IParameter {
  location: OpenAPIParameterLocation;
  name: string;
  required: boolean;
  value: any;
}
