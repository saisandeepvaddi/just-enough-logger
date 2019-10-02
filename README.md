# just-enough-logger

Minimal logger for nodejs

# Installation

`npm install just-enough-logger`

or

`yarn add just-enough-logger`

# Usage

```js
const Logger = require("just-enough-logger").default; // Don't forget default;

or;

import Logger from "just-enough-logger"; // ES6 or TS

let log = new Logger();

// let log = new Logger(options?); // Check options

// By default, prints to a file and console
// Default file is current_directory/log.log
// Check the options for more details

log.info("this is info message");
// 10/2/2019, 12:57:14 AM : [INFO] : this is info message

log.warn("this is warn message");
// 10/2/2019, 12:57:14 AM : [WARN] : this is warn message

log.error("this is error message");
// 10/2/2019, 12:57:14 AM : [ERROR] : this is error message
```

# Options

Pass the options object to Logger constructor.

## transports

- Where to print log message
- Type: _Array_
- Valid Values: `["file", "console"]`
- **Default**: `["file", "console"]`

Example:

```js
let log = new Logger({
  transports: ["console"], // Only prints on console
});
```

## file

- Path of log file
- Type: Path String
- Valid Values: `/path/to/log.log`
- **Default**: `[current_directory]/log.log`

## formatter

- Custom formatter
- Type: Function
- Signature: `(message: string, level: "info" | "warn" | "error") => string`
- **Default**: Returns log in format `${new Date().toLocaleString()} : [${level.toUpperCase()}] : ${message}`

Example:

```js
let log = new Logger({
  formatter: (message, level) => {
    return `${new Date()} ${level} ${message}`;
  },
});
```

# Methods

Methods work on instance of Logger

## getLogFilePath()

- Returns the path of log file.

```js
let logger = new Logger();
console.log(logger.getLogFilePath()); // c:\Programming\my-project\log.log
```

# License

[MIT](/LICENSE) - [@saisandeepvaddi](https://github.com/saisandeepvaddi)
