const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

const Dataloader = require('dataloader');

const Bluebird = require('bluebird');
const chunk = require('lodash.chunk');
const flatten = require('lodash.flatten');

const getParameters = ({ parameterNames }) => {
  return ssm.getParameters({
    Names: parameterNames,
    WithDecryption: true
  })
  .promise()
  .then(({ Parameters: parameters, InvalidParameters }) => {
    if (InvalidParameters.length) {
      throw new Error(`Unabled to fetch: ${JSON.stringify(InvalidParameters)}`)
    }

    return parameterNames.map(name => {
      const parameter = parameters.find(parameter => parameter.Name === name) || {};
      return parameter.Value;
    });
  })
}

const options = {
  maxBatchSize: 100,
  cache: true
};

const makeGetParameters =
({ path }) => {
  const loader = new Dataloader(
    keys => {
      const parameterNames = keys.map(key => `${path}/${key}`);
      const chunks = chunk(parameterNames,  10);

      return Bluebird.map(
        chunks,
        tenParameterNames => getParameters({
          parameterNames: tenParameterNames
        })
      )
      .then(flatten)
    },
    options
  );

  return async keys => {
    const parameters = await loader.loadMany(keys)
    return parameters.reduce(
      (acc, parameter, index) => Object.assign({}, acc, { [keys[index]]: parameter }),
      {}
    );
  };
}

module.exports = {
  makeGetParameters
};
