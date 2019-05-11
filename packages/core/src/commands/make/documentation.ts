import { flags } from '@oclif/command';
import BaseCommand from '../../application/BaseCommand';
import { ApiModel } from '@comet-cli/types';
import { writeFile } from 'fs-extra';

export default class MakeDocumentation extends BaseCommand {
  /** Description of the command, displayed when using help flag */
  static description = 'Parse an API specification, and automatically generate API documentation';

  /** Example usages, displayed when using help flag */
  static examples = [
    '$ comet make:documentation api.json',
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
  protected signature = 'make:documentation';

  /** Command config key */
  protected configKey = 'make.documentation';

  /**
   * Run the command.
   * Generates valid JSON schemas.
   */
  async run() {
    this.logger.comet('Generating API documentation...');
    // Parse passed arguments
    const { args, flags } = this.parse(MakeDocumentation);
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
    await writeFile('./result.json', JSON.stringify(specification, null, 2));
    await this.runPlugins(specification);
  }
}
