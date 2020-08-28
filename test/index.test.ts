import { Logger, Level } from "../src";
import fs from "fs";
import { resolve, dirname } from "path";
import { yellow, red } from "colors";

jest.mock("fs");

let originalConsole = global.console;

global.console = {
  ...global.console,
  log: jest.fn(str => str),
  info: jest.fn(str => str),
  warn: jest.fn(str => str),
  error: jest.fn(str => str),
};

function __defaultFormatter(message: string, level: Level) {
  if (level === "log") {
    return `${new Date().toLocaleString()} : ${message}`;
  }
  return `${new Date().toLocaleString()} : [${level.toUpperCase()}] : ${message}`;
}

describe("All Tests", () => {
  test("only uses specified transports", () => {
    let fileLogger = new Logger({
      transports: ["file"],
    });

    fileLogger.info("Test Message");
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.openSync).toHaveBeenCalled();

    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();

    (fs.existsSync as jest.Mock).mockReset();
    (fs.openSync as jest.Mock).mockReset();

    let consoleLogger = new Logger({
      transports: ["console"],
    });

    consoleLogger.log("Test Message");
    consoleLogger.info("Test Message");
    consoleLogger.warn("Test Message");
    consoleLogger.error("Test Message");

    expect(fs.existsSync).not.toHaveBeenCalled();
    expect(fs.openSync).not.toHaveBeenCalled();
    expect(fs.appendFileSync).not.toHaveBeenCalled();

    expect(console.info).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  test("creates a log file at given path", () => {
    let logFilePath = resolve(__dirname, "test.log");
    new Logger({
      file: logFilePath,
    });

    expect(fs.existsSync).toHaveBeenCalledWith(logFilePath);
    expect(fs.openSync).toHaveBeenCalledWith(logFilePath, "w");

    jest.resetAllMocks();

    // Case where dir doesn't exist
    let newLogFilePath = resolve(__dirname, "my_logs", "test.log");
    new Logger({
      file: newLogFilePath,
    });

    expect(fs.mkdirSync).toHaveBeenCalledWith(dirname(newLogFilePath));
    expect(fs.existsSync).toHaveBeenCalledWith(newLogFilePath);
    expect(fs.openSync).toHaveBeenCalledWith(newLogFilePath, "w");
  });

  test("does not create same log file more than once", () => {
    let logFilePath = resolve(__dirname, "test.log");

    fs.existsSync = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    new Logger({
      file: logFilePath,
    });

    new Logger({
      file: logFilePath,
    });

    expect(fs.existsSync).toHaveBeenCalledTimes(4);
    expect(fs.openSync).toHaveBeenCalledTimes(1);
  });

  test("returns correct log file path", () => {
    let defaultFilePath = resolve(process.cwd(), "log.log");
    let customFilePath = resolve(__dirname, "test.log");

    let logger = new Logger();
    expect(logger.getLogFilePath()).toBe(defaultFilePath);

    let customFileLogger = new Logger({
      file: customFilePath,
    });

    expect(customFileLogger.getLogFilePath()).toBe(customFilePath);
  });

  test("prints to console with correct level", () => {
    let logger = new Logger({
      transports: ["console"],
    });

    let message = "Test message";
    logger.log(message);
    let logMessage = __defaultFormatter(message, "log");
    logger.info(message);
    let infoMessage = __defaultFormatter(message, "info");
    logger.warn(message);
    let warnMessage = __defaultFormatter(message, "warn");
    logger.error(message);
    let errorMessage = __defaultFormatter(message, "error");

    expect(console.log).toHaveBeenCalledWith(logMessage);
    expect(console.info).toHaveBeenCalledWith(infoMessage);
    expect(console.warn).toHaveBeenCalledWith(yellow(warnMessage));
    expect(console.error).toHaveBeenCalledWith(red(errorMessage));
  });

  test("logs to file with correct level", () => {
    let logFilePath = resolve(__dirname, "test.log");

    let logger = new Logger({
      transports: ["file"],
      file: logFilePath,
    });

    let message = "Test message";
    logger.log(message);

    logger.info(message);
    // let infoMessage = __defaultFormatter(message, "info");
    logger.warn(message);
    // let warnMessage = __defaultFormatter(message, "warn");
    logger.error(message);
    // let errorMessage = __defaultFormatter(message, "error");

    // const _stream = logger.getLogStream();
    // expect(_stream).not.toBeNull();

    // expect(_stream!.write).toHaveBeenCalledWith(infoMessage + "\n");
    // expect(_stream!.write).toHaveBeenCalledWith(warnMessage + "\n");
    // expect(_stream!.write).toHaveBeenCalledWith(errorMessage + "\n");
  });

  test("prints on both transports", () => {
    let logFilePath = resolve(__dirname, "test.log");

    let logger = new Logger({
      transports: ["console", "file"],
      file: logFilePath,
    });

    // const _stream = logger.getLogStream();
    // expect(_stream).not.toBeNull();

    let message = "Test message";
    logger.log(message);
    let logMessage = __defaultFormatter(message, "log");
    logger.info(message);
    let infoMessage = __defaultFormatter(message, "info");
    logger.warn(message);
    let warnMessage = __defaultFormatter(message, "warn");
    logger.error(message);
    let errorMessage = __defaultFormatter(message, "error");

    expect(console.log).toHaveBeenCalledWith(logMessage);
    expect(console.info).toHaveBeenCalledWith(infoMessage);
    expect(console.warn).toHaveBeenCalledWith(yellow(warnMessage));
    expect(console.error).toHaveBeenCalledWith(red(errorMessage));

    // expect(_stream!.write).toHaveBeenCalledWith(infoMessage + "\n");
    // expect(_stream!.write).toHaveBeenCalledWith(warnMessage + "\n");
    // expect(_stream!.write).toHaveBeenCalledWith(errorMessage + "\n");
  });

  test("prints with custom format", () => {
    let logFilePath = resolve(__dirname, "test.log");

    let format = (message: string, level: Level) => {
      return `${level}:${message}`;
    };

    let logger = new Logger({
      file: logFilePath,
      formatter: format,
    });

    // const _stream = logger.getLogStream();
    // expect(_stream).not.toBeNull();

    let message = "test message";

    logger.log("test message");
    logger.info("test message");
    logger.warn("test message");
    logger.error("test message");

    // expect(_stream!.write).toHaveBeenCalledWith(format(message, "info") + "\n");
    // expect(_stream!.write).toHaveBeenCalledWith(format(message, "warn") + "\n");
    // expect(_stream!.write).toHaveBeenCalledWith(
    //   format(message, "error") + "\n"
    // );

    expect(console.log).toHaveBeenCalledWith(format(message, "log"));
    expect(console.info).toHaveBeenCalledWith(format(message, "info"));
    expect(console.warn).toHaveBeenCalledWith(yellow(format(message, "warn")));
    expect(console.error).toHaveBeenCalledWith(red(format(message, "error")));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
    console = originalConsole;
  });
});
