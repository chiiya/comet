import { flags } from '@oclif/command';
import BaseCommand from '../../application/BaseCommand';
import { ApiModel } from '@comet-cli/types';

export default class MakeSchemas extends BaseCommand {
  /** Description of the command, displayed when using help flag */
  static description = 'Parse an API specification, and automatically generate JSON schemas';

  /** Example usages, displayed when using help flag */
  static examples = [
    '$ comet make:schemas api.json',
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
    output: flags.string({
      char: 'o',
    }),
  };

  /** Command signature */
  protected signature = 'make:schemas';

  /** Command config key */
  protected configKey = 'make.schemas';

  /**
   * Run the command.
   * Generates valid JSON schemas.
   */
  async run() {
    this.logger.comet('Generating JSON schema files...');
    // Parse passed arguments
    const { args, flags } = this.parse(MakeSchemas);
    const file = await this.loadFile(args);

    if (flags.output) {
      this.configRepository.set(`commands.${this.configKey}.output`, flags.output);
    }

    const specification = await this.parseSpec(file);
    await this.execute(specification);
  }

  /**
   * Execute the command itself (decorate and write output).
   */
  async execute(specification: ApiModel) {
    this.logger.spin('Creating JSON Schemas...');
    await this.runPlugins(specification);
    this.logger.succeed('JSON Schemas created');
  }
}
