export class Logger {
  public static debug(
    unit: string,
    message: string,
    ...data: Array<any>
  ): void {
    this._log({ unit, message, data, level: LogLevel.DEBUG });
  }

  public static log(unit: string, message: string, ...data: Array<any>): void {
    this._log({ unit, message, data, level: LogLevel.LOG });
  }

  public static info(unit: string, message: string, ...data: Array<any>): void {
    this._log({ unit, message, data, level: LogLevel.INFO });
  }

  public static warn(unit: string, message: string, ...data: Array<any>): void {
    this._log({ unit, message, data, level: LogLevel.WARN });
  }

  public static error(
    unit: string,
    message: string,
    ...data: Array<any>
  ): void {
    this._log({ unit, message, data, level: LogLevel.ERROR });
  }

  private static _log({
    unit,
    message,
    data,
    level
  }: {
    unit: string;
    message: string;
    data: Array<any>;
    level: LogLevel;
  }): void {
    let logFunction = null;
    switch (level) {
      case LogLevel.FATAL:
      case LogLevel.ERROR:
        logFunction = console.error;
        break;

      case LogLevel.WARN:
        logFunction = console.warn;
        break;

      case LogLevel.INFO:
      case LogLevel.LOG:
      default:
        logFunction = console.log;
        break;

      case LogLevel.DEBUG:
        logFunction = console.debug;
    }

    logFunction(`${unit}:`, message, ...data);
  }
}

enum LogLevel {
  FATAL,
  ERROR,
  WARN,
  INFO,
  LOG,
  DEBUG
}
