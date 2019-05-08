import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Information } from '@comet-cli/types';

export default class InformationTransformer {
  public static execute(spec: Api): Information {
    const description = spec.description();
    console.log(description);
    return {
      version: spec.version(),
      name: spec.title(),
      description: description ? description.value() : null,
      servers: [null],
    };
  }
}
