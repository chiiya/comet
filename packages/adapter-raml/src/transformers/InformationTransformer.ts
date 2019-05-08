import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Dict, Information, Schema, Server } from '@comet-cli/types';
import SchemaTransformer, { MergedTypeDeclaration } from './SchemaTransformer';

export default class InformationTransformer {
  public static execute(spec: Api): Information {
    const description = spec.description();
    return {
      version: spec.version(),
      name: spec.title(),
      description: description ? description.value() : null,
      servers: this.transformServers(spec),
    };
  }

  protected static transformServers(spec: Api): Server[] {
    const baseUri = spec.baseUri();
    if (baseUri === null) {
      return [];
    }
    const variables: Dict<Schema> = {};
    const baseUriParameters = spec.baseUriParameters();
    for (const parameter of baseUriParameters) {
      variables[parameter.name()] = SchemaTransformer.execute(<MergedTypeDeclaration>parameter);
    }
    const server: Server = {
      variables,
      uri: baseUri.value(),
      description: null,
    };
    return [server];
  }
}
