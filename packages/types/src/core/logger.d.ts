export interface LoggerInterface {
  comet(message: string): void;
  spin(message: string): void;
  succeed(message: string): void;
  fail(message: string): void;
  warn(message: string): void;
  printWarnings(warnings: any[][]): void;
  printErrors(errors: any[][]): void;
}
