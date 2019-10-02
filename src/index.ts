import { resolve, parse } from "path";
import { existsSync, openSync, appendFileSync, mkdirSync } from "fs";

export type Transport = "file" | "console";
export type Level = "info" | "warn" | "error";

/**
 *Logger options interface
 *
 * @export
 * @interface ILoggerOptions
 */
export interface ILoggerOptions {
  transports?: Transport[];
  file?: string;
  formatter?: (message: string, level: Level) => string;
}

/**
 *
 *
 * @interface ILogger
 */
interface ILogger {
  options: ILoggerOptions;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

/**
 * Logger class
 *
 * @class Logger
 * @implements {ILogger}
 */
class Logger implements ILogger {
  options: ILoggerOptions = {
    transports: ["file", "console"],
    file: resolve(process.cwd(), "log.log"),
    formatter: this.__formatter,
  };

  /**
   * Creates an instance of Logger.
   * @param {ILoggerOptions} [options]
   * @memberof Logger
   */
  constructor(options?: ILoggerOptions) {
    this.options = {
      ...this.options,
      ...options,
    };

    if (this.__shouldWriteToFile()) {
      this.__createLogFile();
    }
  }

  /**
   * Prints message with INFO level
   *
   * @param {string} message
   * @memberof Logger
   */
  public info(message: string) {
    this.__write(message, "info");
  }

  /**
   * Prints message with WARN level
   *
   * @param {string} message
   * @memberof Logger
   */
  public warn(message: string) {
    this.__write(message, "warn");
  }

  /**
   * Prints message with ERROR level
   *
   * @param {string} message
   * @memberof Logger
   */
  public error(message: string) {
    this.__write(message, "error");
  }

  /**
   * Returns the log file path for this logger instance.
   *
   * @returns {string} Path of log file.
   * @memberof Logger
   */
  public getLogFilePath() {
    const { file } = this.options;
    if (file) {
      return resolve(file);
    }

    return null;
  }

  /**
   * Creates log message with custom format. Default is: `new Date().toLocaleString() : [LEVEL] : message`
   *
   * @param {string} message
   * @param {Level} level
   * @returns {string} The output message
   * @memberof Logger
   */
  private __formatter(message: string, level: Level) {
    return `${new Date().toLocaleString()} : [${level.toUpperCase()}] : ${message}`;
  }

  private __shouldWriteToFile(): boolean {
    return this.options.transports!.indexOf("file") > -1;
  }

  private __shouldWriteToConsole(): boolean {
    return this.options.transports!.indexOf("console") > -1;
  }

  private __createLogFile() {
    const { file } = this.options;
    if (file) {
      const { dir } = parse(file);

      if (!existsSync(dir)) {
        mkdirSync(dir);
      }

      if (!existsSync(file)) {
        openSync(file, "w");
      }
    }
  }

  private __writeToFile(message: string) {
    const { file } = this.options;
    if (file) {
      appendFileSync(file, message + "\n");
    }
  }

  private __writeToConsole(message: string, level: Level) {
    console[level](message);
  }

  private __write(message: string, level: Level) {
    const { formatter } = this.options;
    if (formatter) {
      let formattedMessage = formatter(message, level);
      if (this.__shouldWriteToConsole()) {
        this.__writeToConsole(formattedMessage, level);
      }
      if (this.__shouldWriteToFile()) {
        this.__writeToFile(formattedMessage);
      }
    }
  }
}

export default Logger;
