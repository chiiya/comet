import { flags } from '@oclif/command';
import File from '../../helpers/File';
import BaseCommand from '../../application/BaseCommand';

export default class MakeTests extends BaseCommand {
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

  /** Command signature */
  protected signature = 'make:tests';

  async run() {
    // Parse passed arguments
    const { args } = this.parse(MakeTests);
    let file;
    try {
      file = new File(args.input);
    } catch (error) {
      error.message = `${args.input} is not a valid file.\n${error.message}`;
      throw error;
    }

    const specification = await this.parseSpec(file);

    console.log(specification.info.version);
  }
}
