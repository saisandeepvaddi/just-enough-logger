import { resolve, parse } from "path";
import {
  existsSync,
  openSync,
  mkdirSync,
  WriteStream,
  createWriteStream,
} from "fs";
import { yellow, red } from "colors";

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
export class Logger implements ILogger {
  options: ILoggerOptions = {
    transports: ["file", "console"],
    file: resolve(process.cwd(), "log.log"),
    formatter: this.__formatter,
  };

  private __fileStream: WriteStream | null = null;

  /**
   * Creates an instance of Logger
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
      this.__fileStream = createWriteStream(this.options.file!, { flags: "a" });
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

  /**
   * Checks if file transport is selected
   *
   * @private
   * @returns {boolean}
   * @memberof Logger
   */
  private __shouldWriteToFile(): boolean {
    return this.options.transports!.indexOf("file") > -1;
  }

  /**
   * Checks if console transport is selected
   *
   * @private
   * @returns {boolean}
   * @memberof Logger
   */
  private __shouldWriteToConsole(): boolean {
    return this.options.transports!.indexOf("console") > -1;
  }

  /**
   * Creates log file if it doesn't exist
   *
   * @private
   * @memberof Logger
   */
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

  /**
   * Writes log message to file
   *
   * @private
   * @param {string} message
   * @memberof Logger
   */
  private __writeToFile(message: string) {
    const { file } = this.options;
    if (file && this.__fileStream) {
      this.__fileStream.write(message + "\n");
    }
  }

  /**
   * Writes log message to console
   *
   * @private
   * @param {string} message
   * @param {Level} level
   * @memberof Logger
   */
  private __writeToConsole(message: string, level: Level) {
    switch (level) {
      case "warn":
        console[level](yellow(message));
        break;
      case "error":
        console[level](red(message));
        break;
      case "info":
        console[level](message);
        break;
    }
  }

  /**
   * Calls appropriate method to write formatted message
   *
   * @private
   * @param {string} message
   * @param {Level} level
   * @memberof Logger
   */
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
   * Returns the file stream of the log file or null if no file transport available.
   *
   * @returns {WritableStream}
   * @memberof Logger
   */
  public getLogStream(): WriteStream | null {
    return this.__fileStream;
  }
}

// Keep default export for backward compatibility.
export default Logger;
