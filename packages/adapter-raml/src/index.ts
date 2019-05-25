import {
  AdapterInterface,
  ApiModel,
  Config,
  LoggerInterface,
} from '@comet-cli/types';
import Parser from './Parser';
import InformationTransformer from './transformers/InformationTransformer';
import { writeFile } from 'fs-extra';
import Specification from './Specification';
import AuthenticationTransformer from './transformers/AuthenticationTransformer';
import SecuredByTransformer from './transformers/SecuredByTransformer';
import ResourceTransformer from './transformers/ResourceTransformer';

export default class RamlAdapter implements AdapterInterface {
  async execute(path: string, config: Config, logger: LoggerInterface): Promise<ApiModel> {
    // Parse input file
    try {
      const result = await Parser.load(path, logger);
      await writeFile('./result-parsed.json', JSON.stringify(result.toJSON(), null, 2));
      const specification = new Specification(result);
      const authentication = AuthenticationTransformer.execute(specification);
      const securedBy = specification.api.securedBy() || [];
      return {
        info: InformationTransformer.execute(specification),
        auth: authentication,
        groups: [],
        resources: ResourceTransformer.execute(specification, authentication),
        securedBy: SecuredByTransformer.execute(specification, securedBy, authentication),
      };
    } catch (error) {
      // Provide a more helpful error message
      if (error.code === 'ENOENT') {
        error.message = `${path}: No such file or directory`;
      } else if (error.name !== 'ParsingException') {
        error.message = `${path} is not a valid RAML schema. \n${error.message}`;
      }
      throw error;
    }
  }

  public name(): string {
    return 'raml';
  }
}
