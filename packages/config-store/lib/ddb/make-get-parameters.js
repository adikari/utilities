const Dataloader = require('dataloader');
const Bluebird = require('bluebird');
const get = require('lodash.get');
const { makeGetLatestVersion } = require('./make-get-latest-version');

const options = {
  maxBatchSize: 100,
  cache: true
};

const makeGetParameters =
({
  path,
  provider
}) => {
  const getLatestVersion = makeGetLatestVersion({
    tableName: get(provider, 'tableName')
  });

  const loader = new Dataloader(
    keys =>
      Bluebird.map(keys, key => getLatestVersion({
        parameterName: `${path}/${key}`
      }))
        .then(parameters => parameters.map(p => get(p, 'value'))),
    options
  );

  return async keys => {
    const parameters = await loader.loadMany(keys)
    return parameters.reduce(
      (acc, parameter, index) => Object.assign({}, acc, { [keys[index]]: parameter }),
      {}
    );
  }
}

module.exports = {
  makeGetParameters
};
