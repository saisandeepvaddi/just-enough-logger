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

class Logger implements ILogger {
  options: ILoggerOptions = {
    transports: ["file", "console"],
    file: resolve(process.cwd(), "log.log"),
  };

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
   * Returns the log file path for this logger instance.
   *
   * @returns {string} Path of log file.
   * @memberof Logger
   */
  public getLogFilePath() {
    return this.options.file;
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

  public formatter(message: string, level: Level) {
    return `${this.__getDate()} : [${level.toUpperCase()}] : ${message}`;
  }

  public info(message: string) {
    let formattedMessage = this.formatter(message, "info");
    if (this.__shouldWriteToConsole()) {
      this.__writeToConsole(formattedMessage, "info");
    }
    if (this.__shouldWriteToFile()) {
      this.__writeToFile(formattedMessage);
    }
  }

  public warn(message: string) {
    let formattedMessage = this.formatter(message, "warn");
    if (this.__shouldWriteToConsole()) {
      this.__writeToConsole(formattedMessage, "warn");
    }
    if (this.__shouldWriteToFile()) {
      this.__writeToFile(formattedMessage);
    }
  }

  public error(message: string) {
    let formattedMessage = this.formatter(message, "error");
    if (this.__shouldWriteToConsole()) {
      this.__writeToConsole(formattedMessage, "error");
    }
    if (this.__shouldWriteToFile()) {
      this.__writeToFile(formattedMessage);
    }
  }
}

export default Logger;
