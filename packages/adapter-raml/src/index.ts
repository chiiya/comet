import { AdapterInterface, ApiModel, CommandConfig, LoggerInterface } from '@comet-cli/types';
import Parser from './Parser';
import InformationTransformer from './transformers/InformationTransformer';
import { writeFile } from 'fs-extra';

export default class RamlAdapter implements AdapterInterface {
  protected config: CommandConfig;
  protected logger: LoggerInterface;

  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    // Parse input file
    try {
      const result = await Parser.load(path, logger);
      await writeFile('./result-parsed.json', JSON.stringify(result, null, 2));
      // const specification = new Specification(result);
      return {
        info: InformationTransformer.execute(result),
        auth: null,
        groups: [],
        resources: [],
        securedBy: null,
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
