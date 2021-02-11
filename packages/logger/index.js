const pino = require('pino');
const { v4: uuid } = require('uuid');

let correlationId = null;

const setCorrelationId = id => {
  if (id) {
    correlationId = id;
  }
};

const getCorrelationId = () => {
  if (!correlationId) {
    correlationId = uuid();
  }

  return correlationId;
};

const metadata = {
  correlationId: getCorrelationId(),
  stage: process.env.STAGE,
  origin: process.env.SERVICE_NAME,
  awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
  functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
  functionMemorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE
};

const redact = [
  'data.address',
  'data.phone',
  'data.email',
  'data.password',
  'data.passwords',
  'data.secret',
  'data.secrets',
  'data.key',
  'data.keys',
  'data.apiKey',
  'data.apiKeys',
  'data.context.keys'
];

const logger = pino({
  level: process.env.LOG_LEVEL || (metadata.stage === 'dev' ? 'debug' : 'info'),
  redact,
  prettyPrint: process.env.IS_OFFLINE === 'true',
  formatters: {
    log: obj => ({ ...metadata, data: obj })
  }
});

module.exports = {
  setCorrelationId,
  getCorrelationId,
  logger
};
