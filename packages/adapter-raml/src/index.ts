import { AdapterInterface, ApiModel, CommandConfig, LoggerInterface } from '@comet-cli/types';
import Parser from './Parser';
import InformationTransformer from './transformers/InformationTransformer';
import { writeFile } from 'fs-extra';
import Specification from './Specification';
import AuthenticationTransformer from './transformers/AuthenticationTransformer';
import SecuredByTransformer from './transformers/SecuredByTransformer';

export default class RamlAdapter implements AdapterInterface {
  protected config: CommandConfig;
  protected logger: LoggerInterface;

  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    // Parse input file
    try {
      const result = await Parser.load(path, logger);
      await writeFile('./result-parsed.json', JSON.stringify(result, null, 2));
      const specification = new Specification(result);
      const authentication = AuthenticationTransformer.execute(specification);
      return {
        info: InformationTransformer.execute(specification),
        auth: authentication,
        groups: [],
        resources: [],
        securedBy: SecuredByTransformer.execute(specification, authentication),
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
}