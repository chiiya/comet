import { Dict, Information, Schema, Server } from '@comet-cli/types';
import SchemaTransformer from './SchemaTransformer';
import Specification from '../Specification';
import ParameterTransformer from './ParameterTransformer';

export default class InformationTransformer {
  public static execute(spec: Specification): Information {
    return {
      version: spec.api.version(),
      name: spec.api.title(),
      description: this.transformDescription(spec),
      servers: this.transformServers(spec),
    };
  }

  protected static transformDescription(spec: Specification): string {
    let description = spec.api.description() ? spec.api.description().value() : '';
    const documentation = spec.api.documentation() || [];
    for (const item of documentation) {
      if (item.content()) {
        description += `\n\n${item.content().value()}`;
      }
    }

    return description;
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
