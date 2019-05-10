import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Dict } from '@comet-cli/types';

export default class Specification {
  public api: Api;
  public authenticationMappings: Dict<string[]>;
  public types: Dict<any>;

  constructor(api: Api) {
    this.api = api;
    this.authenticationMappings = {};
    this.constructTypes();
  }

  protected constructTypes(): void {
    const model = this.api.toJSON({ serializeMetadata: false });
    const types = model.types || [];
    this.types = {};
    // Convert array to object for easy access.
    for (const type of types) {
      const keys = Object.keys(type);
      for (const key of keys) {
        this.types[key] = type[key];
      }
    }
  }
}
