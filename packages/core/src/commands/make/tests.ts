import { flags } from '@oclif/command';
import BaseCommand from '../../application/BaseCommand';
import { ApiModel, OpenApiSpec } from '@comet-cli/types';

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
    output: flags.string({
      char: 'o',
    }),
  };

  /** Command signature */
  protected signature = 'make:tests';

  /** Command config key */
  protected configKey = 'make.tests';

  /**
   * Run the command.
   * Generates test cases.
   */
  async run() {
    this.logger.comet('Generating test cases...');
    // Parse passed arguments
    const { args, flags } = this.parse(MakeTests);
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
    this.logger.spin('Creating test case definitions...');
    await this.runPlugins(specification);
    this.logger.succeed('Test cases created');
    this.printWarnings();
  }
}
