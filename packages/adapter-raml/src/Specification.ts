import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Dict } from '@comet-cli/types';

export default class Specification {
  public api: Api;
  public authenticationMappings: Dict<string[]>;

  constructor(api: Api) {
    this.api = api;
    this.authenticationMappings = {};
  }
}
