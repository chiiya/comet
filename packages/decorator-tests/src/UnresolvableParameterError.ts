export default class UnresolvableParameterError extends Error {
  parameter: string;
  name: string;

  constructor(message: string, parameter: string) {
    super(message);
    this.parameter = parameter;
    this.name = 'UnresolvableParameterError';
    Object.setPrototypeOf(this, UnresolvableParameterError.prototype);
  }
}
