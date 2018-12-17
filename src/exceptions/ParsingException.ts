export default class ParsingException extends Error {
  /**
   * ParsingException constructor.
   * @param {string} message
   */
  constructor(message: string) {
    super();
    this.name = 'ParsingException';
    this.message = message;
  }
}
