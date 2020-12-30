const get = require('lodash.get');
const {
  makeGetParameters: makeGetParametersFromDdb
} = require('./ddb/make-get-parameters');
const {
  makeGetParameters: makeGetParametersFromSsm
} = require('./ssm/make-get-parameters');

const makeParameterStore = ({ configPath, secretPath, provider }) => {
  const providerName = get(provider, 'name');
  const ssmMode = providerName === 'ssm';

  const getConfigsFromDdb = makeGetParametersFromDdb({
    path: configPath,
    provider
  });

  const getSecretsFromDdb = makeGetParametersFromDdb({
    path: secretPath,
    provider
  })

  const getConfigsFromSsm = makeGetParametersFromSsm({
    path: configPath
  });

  const getSecretsFromSsm = makeGetParametersFromSsm({
    path: secretPath
  });

  return {
    getConfigs: ssmMode ? getConfigsFromSsm : getConfigsFromDdb,
    getSecrets: ssmMode ? getSecretsFromSsm : getSecretsFromDdb
  };
};

module.exports = { makeParameterStore };
