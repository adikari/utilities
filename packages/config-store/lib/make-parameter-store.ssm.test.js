'use strict';
const AWS = require('aws-sdk');
const mockGetParameters = jest.fn();

AWS.SSM.mockImplementation(function() {
  return {
    getParameters: mockGetParameters
  }
});

const { makeConfigStore } = require('../index');
const provider = {
  name: 'ssm'
};

describe('#ParameterStore - SSM', () => {
  it ('should return configs for a given keys', () => {
    const configPath = '/stage/config';
    const secretPath = '/stage/secret';

    mockGetParameters.mockClear();
    mockGetParameters
      .mockImplementation(() => {
        return {
          // The parameters returned are out of order to mimic SSM behavior
          promise: () => Promise.resolve({
            Parameters: [
              {
                Name: '/stage/config/CONFIG_2',
                Value: 'config 2'
              },
              {
                Name: '/stage/config/CONFIG_1',
                Value: 'config 1'
              }
            ],
            InvalidParameters: []
          })
        }
      });

    const parameterStore = makeConfigStore({ configPath, secretPath, provider });

    return parameterStore
      .getConfigs(['CONFIG_1', 'CONFIG_2'])
      .then(configs => {
        expect(configs).toEqual({ CONFIG_1: 'config 1', CONFIG_2: 'config 2' });
      });
  });

  it ('should return secrets for a given keys', () => {
    const configPath = '/stage/config';
    const secretPath = '/stage/secret';

    mockGetParameters.mockClear();
    mockGetParameters
      .mockImplementation(() => {
        return {
          promise: () => Promise.resolve({
            Parameters: [
              {
                Name: '/stage/secret/SECRET_1',
                Value: 'secret 1'
              },
              {
                Name: '/stage/secret/SECRET_2',
                Value: 'secret 2'
              }
            ],
            InvalidParameters: []
          })
        }
      });

    const parameterStore = makeConfigStore({ configPath, secretPath, provider });

    return parameterStore
      .getSecrets(['SECRET_1', 'SECRET_2'])
      .then(secrets => {
        expect(secrets).toEqual({ SECRET_1: 'secret 1', SECRET_2: 'secret 2' });
      });
  });

  it('should cache the keys once retrieved from ssm', () => {
    const configPath = '/stage/config';
    const secretPath = '/stage/secret';

    mockGetParameters.mockClear();
    mockGetParameters
      .mockImplementation(() => {
        return {
          promise: () => Promise.resolve({
            Parameters: [
              {
                Name: '/stage/config/CONFIG_1',
                Value: 'config 1'
              },
              {
                Name: '/stage/config/CONFIG_2',
                Value: 'config 2'
              }
            ],
            InvalidParameters: []
          })
        }
      });

    const parameterStore = makeConfigStore({ configPath, secretPath, provider });

    return parameterStore.getConfigs([
      'CONFIG_1',
      'CONFIG_2'
    ])
    .then(configs => {
      expect(configs).toEqual({
        CONFIG_1: 'config 1',
        CONFIG_2: 'config 2'
      });

      expect(mockGetParameters.mock.calls.length).toEqual(1);

      return parameterStore.getConfigs([
        'CONFIG_1',
        'CONFIG_2'
      ])
    })
    .then(configs => {
      expect(configs).toEqual({
        CONFIG_1: 'config 1',
        CONFIG_2: 'config 2'
      });

      expect(mockGetParameters.mock.calls.length).toEqual(1);
    })
  });

  it('should throw an error when a value cannot be retreived', () => {
    const configPath = '/stage/config';
    const secretPath = '/stage/secret';

    mockGetParameters.mockClear();
    mockGetParameters
      .mockImplementation(() => {
        return {
          promise: () => Promise.resolve({
            Parameters: [
              {
                Name: '/stage/secret/SECRET_1',
                Value: 'secret 1'
              }
            ],
            InvalidParameters: ['/stage/secret/SECRET_2']
          })
        }
      });

    const parameterStore = makeConfigStore({ configPath, secretPath, provider });

    return expect(parameterStore.getSecrets(['SECRET_1', 'SECRET_2']))
      .rejects.toThrow('Unabled to fetch: ["/stage/secret/SECRET_2"]');
  });
});





