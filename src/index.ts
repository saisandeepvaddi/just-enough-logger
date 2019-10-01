import { resolve } from 'path';
import { existsSync, openSync, appendFileSync } from 'fs';

type Transport = 'file' | 'console';
type Level = 'info' | 'warn' | 'error';
interface ILoggerOptions {
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
    transports: ['file', 'console'],
    file: resolve(__dirname),
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

  private __getDate() {
    return new Date().toLocaleString();
  }

  private __shouldWriteToFile(): boolean {
    return this.options.transports!.indexOf('file') > -1;
  }

  private __shouldWriteToConsole(): boolean {
    return this.options.transports!.indexOf('console') > -1;
  }

  private __createLogFile() {
    const { file } = this.options;
    if (file && !existsSync(file)) {
      openSync(file, 'w');
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

  private __formatMessage(message: string, level: Level) {
    return `${this.__getDate()} : [${level.toUpperCase()}] : ${message}`;
  }

  public info(message: string) {
    let formattedMessage = this.__formatMessage(message, 'info');
    if (this.__shouldWriteToConsole()) {
      this.__writeToConsole(formattedMessage, 'info');
    }
    if (this.__shouldWriteToFile()) {
      this.__writeToFile(formattedMessage);
    }
  }

  public warn(message: string) {
    let formattedMessage = this.__formatMessage(message, 'warn');
    if (this.__shouldWriteToConsole()) {
      this.__writeToConsole(formattedMessage, 'warn');
    }
    if (this.__shouldWriteToFile()) {
      this.__writeToFile(formattedMessage);
    }
  }

  public error(message: string) {
    let formattedMessage = this.__formatMessage(message, 'error');
    if (this.__shouldWriteToConsole()) {
      this.__writeToConsole(formattedMessage, 'error');
    }
    if (this.__shouldWriteToFile()) {
      this.__writeToFile(formattedMessage);
    }
  }
}

export default Logger;
