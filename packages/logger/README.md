# Serverless Logger

Library to use as logger in your serverless application. This wraps around pino logging library and provides some sane defaults for logging in AWS.

## Installation

```
# Via yarn
$ yarn add @adikari/logger

# Via npm
$ npm install @adikari/logger
```


## How to use

Check pino api reference for list of all available methods.

#### Setting log level
By default the `level` is set to `info`. You can override by setting environment variable called `LOG_LEVEL`.
If `STAGE` is set to `dev`, then the level will be set to `debug` if `LOG_LEVEL` environment variable is not present.

```yml
const { logger } = require('@adikari/logger');

const handler = event => {
  logger.debug(event, 'serverless event');
  logger.info({ userid: 'anton' }, 'user');
};

module.exports = { handler };
```

This library adds extra metadata
