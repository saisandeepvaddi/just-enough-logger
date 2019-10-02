import { resolve } from "path";
import { existsSync, openSync, appendFileSync } from "fs";

export type Transport = "file" | "console";
export type Level = "info" | "warn" | "error";

export interface ILoggerOptions {
  transports?: Transport[];
  file?: string;
}

interface ILogger {
  options: ILoggerOptions;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

/**
 *
 *
 * @class Logger
 * @implements {ILogger}
 */
class Logger implements ILogger {
  options: ILoggerOptions = {
    transports: ["file", "console"],
    file: resolve(process.cwd(), "log.log"),
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
    return this.options.file;
  }

  /**
   * Creates output custom format. Default is: `new Date().toLocaleString() : [LEVEL] : message`
   *
   * @param {string} message
   * @param {Level} level
   * @returns {string} The output message
   * @memberof Logger
   */
  public formatter(message: string, level: Level) {
    return `${this.__getDate()} : [${level.toUpperCase()}] : ${message}`;
  }

  private __getDate() {
    return new Date().toLocaleString();
  }

  private __shouldWriteToFile(): boolean {
    return this.options.transports!.indexOf("file") > -1;
  }

  private __shouldWriteToConsole(): boolean {
    return this.options.transports!.indexOf("console") > -1;
  }

  private __createLogFile() {
    const { file } = this.options;
    if (file && !existsSync(file)) {
      openSync(file, "w");
    }
  }

  private __writeToFile(message: string) {
    const { file } = this.options;
    if (file) {
      appendFileSync(file, message);
    }
  }

  private __writeToConsole(message: string, level: Level) {
    console[level](message);
  }

  private __write(message: string, level: Level) {
    let formattedMessage = this.formatter(message, level);
    if (this.__shouldWriteToConsole()) {
      this.__writeToConsole(formattedMessage, level);
    }
    if (this.__shouldWriteToFile()) {
      this.__writeToFile(formattedMessage);
    }
  }
}

export default Logger;
