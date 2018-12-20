import { flags } from '@oclif/command';
import { displayHelp } from '../../helpers/Helpers';
import BaseCommand from '../../application/BaseCommand';

export default class Make extends BaseCommand {

  /** Short and full description of the command */
  static description = `Operations for creating different artifacts
The make commands will help you create different outputs (e.g. tests or documentation)
`;

  /** Override usage to indicate that a sub-command must be used */
  static usage = 'make:{artifact}';

  /** Flags passed to the command */
  static flags = {
    help: flags.help({ char: 'h' }),
  };

  /**
   * Run the make command, displaying help.
   */
  async run() {
    console.log(this.configRepository.get('commands.make.tests.parser'));
    displayHelp(this.id);
    this.exit();
  }
}
