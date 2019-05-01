import { Signale } from 'signale';
import * as Ora from 'ora';
import { LoggerInterface } from '@comet-cli/types';

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
export default class Logger implements LoggerInterface {
  protected console: Signale;
  protected spinner: any;

  /**
   * Logger constructor
   */
  constructor() {
    this.console = new Signale(options);
    // @ts-ignore
    this.spinner = new Ora({ spinner: 'star' });
  }

  /**
   * Log a console message using the comet style defined above.
   * @param {string} message
   */
  comet(message: string): void {
    // @ts-ignore
    this.console.comet(message);
  }

  /**
   * Start spinning the spinner instance.
   * @param {string} message
   */
  spin(message: string): void {
    this.spinner.text = message;
    if (this.spinner.isSpinning === false) {
      this.spinner.start();
    }
  }

  /**
   * Stop the spinner, set it to green, and persist it.
   * @param {string} message
   */
  succeed(message: string): void {
    if (this.spinner.isSpinning === true) {
      this.spinner.succeed(message);
    }
  }

  /**
   * Stop the spinner, set it to red, and persist it.
   * @param {string} message
   */
  fail(message: string): void {
    if (this.spinner.isSpinning === true) {
      this.spinner.fail(message);
    }
  }

  /**
   * Print a warning message to console.
   * @param message
   */
  warn(message: string): void {
    this.console.warn(message);
  }
}
