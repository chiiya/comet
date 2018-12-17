import { Command, flags } from '@oclif/command';
import Logger from '../../helpers/Logger';
import File from '../../helpers/File';
import OpenApiParser from '../../parsers/OpenApiParser';

export default class MakeTests extends Command {
  /** Description of the command, displayed when using help flag */
  static description = 'Parse an API specification, and automatically generate integration tests';

  /** Example usages, displayed when using help flag */
  static examples = [
    '$ comet make:tests api.json',
  ];

  /** Positional arguments passed to the command */
  static args = [
    {
      name: 'input',
      required: true,
      description: 'relative or absolute path to the input file (your API specification)',
    },
  ];

  /** Optional flags passed to the command */
  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const logger = new Logger();
    const parser = new OpenApiParser();

    // Parse passed arguments
    const { args } = this.parse(MakeTests);
    const file = new File(args.input);

    // Parse input file
    logger.spin('Parsing input file');
    try {
      const spec = await parser.execute(file.path());
      console.log(spec.info.version);
    } catch (error) {
      logger.fail(error.message);
      process.exit(-1);
    }
    logger.succeed('Input file parsed');
  }
}
