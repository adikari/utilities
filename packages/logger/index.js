const pino = require('pino');
const { v4: uuid } = require('uuid');

const metadata = {
  correlationId: uuid(),
  stage: process.env.STAGE,
  origin: process.env.SERVICE_NAME,
  awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
  functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
  functionMemorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE
};

const redact = [
  'address',
  'phone',
  'email',
  'password',
  'secret',
  'key',
  'apiKey'
];

const logger = pino({
  level: process.env.LOG_LEVEL || (metadata.stage === 'dev' ? 'debug' : 'info'),
  redact,
  mixin: () => ({ ...metadata })
});

const setCorrelationId = id => {
  metadata.correlationId = id;
};

const getCorrelationId = () => metadata.correlationId;

module.exports = {
  setCorrelationId,
  getCorrelationId,
  logger
};
