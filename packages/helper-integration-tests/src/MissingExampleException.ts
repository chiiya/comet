export default class MissingExampleException extends Error {
  /**
   * MissingExampleException constructor.
   * @param message
   */
  constructor(message: string) {
    super();
    this.name = 'MissingExampleException';
    this.message = message;
  }
}
