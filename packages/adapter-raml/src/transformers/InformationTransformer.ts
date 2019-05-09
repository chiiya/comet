import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Dict, Information, Schema, Server } from '@comet-cli/types';
import SchemaTransformer from './SchemaTransformer';
import Specification from '../Specification';

export default class InformationTransformer {
  public static execute(spec: Specification): Information {
    const description = spec.api.description();
    return {
      version: spec.api.version(),
      name: spec.api.title(),
      description: description ? description.value() : null,
      servers: this.transformServers(spec),
    };
  }

  protected static transformServers(spec: Specification): Server[] {
    const baseUri = spec.api.baseUri();
    if (baseUri === null) {
      return [];
    }
    const variables: Dict<Schema> = {};
    const baseUriParameters = spec.api.baseUriParameters();
    for (const parameter of baseUriParameters) {
      variables[parameter.name()] = SchemaTransformer.execute(spec, parameter);
    }
    const server: Server = {
      variables,
      uri: baseUri.value(),
      description: null,
    };
    return [server];
  }
}
