import { Command, flags } from '@oclif/command';
import Logger from '../../lib/Logger';

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
    logger.comet('Starting build');
    logger.spin('Compiling...');
    setTimeout(() => {
      logger.succeed('Compiled files');
      logger.comet('Build complete.');
    },         2000);
  }
}
