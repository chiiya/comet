import { ApiModel, CommandConfig, LoggerInterface, ParserInterface } from '@comet-cli/types';
import { readFile } from 'fs-extra';
import { Fury } from 'fury';
const apiBlueprintParser = require('fury-adapter-apib-parser');

export default class ApiBlueprintParser implements ParserInterface {
  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    try {
      const source = await readFile(path);
      const fury = new Fury();
      fury.use(apiBlueprintParser);
      logger.spin('Parsing API Blueprint specification...');
      const result = fury.parse(source);
      console.log(result.api.title);
      return {
        info: {
          name: result.api.title,
          host: '',
        },
        resources: [],
        groups: [],
      };
    } catch (error) {
      // Provide a more helpful error message
      if (error.code === 'ENOENT') {
        error.message = `${path}: No such file or directory`;
      } else {
        error.message = `${path} is not a valid API Blueprint schema. \n${error.message}`;
      }
      throw error;
    }
  }

}
