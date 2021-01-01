'use strict';

const get = require('lodash.get');
const map = require('lodash.map');

const makeFetch = ({ parameterStore, settingsService }) => {
  return ({ keys }) =>
    settingsService
      .getSettings()
      .then(settings => [
        ...get(settings, 'configParameters'),
        ...get(settings, 'secretParameters')
      ])
      .then(parametersFromSetting =>
        map(keys, key =>
          parametersFromSetting.find(param => param.split('/').pop() === key)
        ).filter(value => value)
      )
      .then(parameterNames =>
        parameterStore.getParameters({
          parameterNames
        })
      )
      .tap(output => console.log(JSON.stringify(output, null, 2)));
};

module.exports = {
  makeFetch
};
