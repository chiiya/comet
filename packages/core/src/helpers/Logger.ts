import { Signale } from 'signale';
import * as Ora from 'ora';

// Signale options
const options = {
  disabled: false,
  interactive: false,
  stream: process.stdout,
  scope: 'comet',
  types: {
    comet: {
      badge: '🌠',
      color: 'cyanBright',
      label: 'comet',
    },
  },
};

/**
 * Logger class
 * Used for custom console logging.
 */
export default class Logger {
  protected console: Signale;
  protected spinner: any;

  /**
   * Logger constructor
   */
  constructor() {
    this.console = new Signale(options);
    this.spinner = new Ora({ spinner: 'star' });
  }

  /**
   * Log a console message using the comet style defined above.
   * @param {string} message
   */
  comet(message: string) {
    // @ts-ignore
    this.console.comet(message);
  }

  /**
   * Start spinning the spinner instance.
   * @param {string} message
   */
  spin(message: string) {
    this.spinner.text = message;
    if (this.spinner.isSpinning === false) {
      this.spinner.start();
    }
  }

  /**
   * Stop the spinner, set it to green, and persist it.
   * @param {string} message
   */
  succeed(message: string) {
    if (this.spinner.isSpinning === true) {
      this.spinner.succeed(message);
    }
  }

  /**
   * Stop the spinner, set it to red, and persist it.
   * @param {string} message
   */
  fail(message: string) {
    if (this.spinner.isSpinning === true) {
      this.spinner.fail(message);
    }
  }
}
