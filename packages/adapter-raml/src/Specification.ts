import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

export default class Specification {
  public api: Api;

  constructor(api: Api) {
    this.api = api;
  }
}
