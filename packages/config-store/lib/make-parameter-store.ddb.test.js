'use strict';

const { makeConfigStore } = require('../index');

const mockGetLatestVersion = jest.fn();

jest.mock('./ddb/make-get-latest-version', () => ({
  makeGetLatestVersion: () => mockGetLatestVersion
}));

mockGetLatestVersion
  .mockImplementation(({ parameterName }) => {
    const ddbStore = {
      '/stage/config/CONFIG_1': {
        name: '/stage/config/CONFIG_1',
        value: 'config 1'
      },
      '/stage/config/CONFIG_2': {
        name: '/stage/config/CONFIG_2',
        value: 'config 2'
      },
      '/stage/secret/SECRET_1': {
        name: '/stage/secret/SECRET_1',
        value: 'secret 1'
      },
      '/stage/secret/SECRET_2': {
        name: '/stage/secret/SECRET_2',
        value: 'secret 2'
      }
    }
    return Promise.resolve(ddbStore[parameterName]);
  });

describe('#ParameterStore - DDB', () => {
  it ('should return configs for a given keys', () => {
    const configPath = '/stage/config';
    const secretPath = '/stage/secret';

    const parameterStore = makeConfigStore({ configPath, secretPath });

    return parameterStore
      .getConfigs(['CONFIG_1', 'CONFIG_2'])
      .then(configs => {
        expect(configs).toEqual({ CONFIG_1: 'config 1', CONFIG_2: 'config 2' });
      });
  });

  it ('should return secrets for a given keys', () => {
    const configPath = '/stage/config';
    const secretPath = '/stage/secret';

    const parameterStore = makeConfigStore({ configPath, secretPath });

    return parameterStore
      .getSecrets(['SECRET_1', 'SECRET_2'])
      .then(secrets => {
        expect(secrets).toEqual({ SECRET_1: 'secret 1', SECRET_2: 'secret 2' });
      });
  });

  it('should cache the keys once retrieved from ddb', () => {
    const configPath = '/stage/config';
    const secretPath = '/stage/secret';

    mockGetLatestVersion.mockClear();

    const parameterStore = makeConfigStore({ configPath, secretPath });

    return Promise.all([
      parameterStore.getConfigs([
        'CONFIG_1',
        'CONFIG_2'
      ]),
      parameterStore.getSecrets([
        'SECRET_1',
        'SECRET_2'
      ])
    ])
    .then(([configs, secrets]) => {
      expect(configs).toEqual({
        CONFIG_1: 'config 1',
        CONFIG_2: 'config 2'
      });

      expect(secrets).toEqual({
        SECRET_1: 'secret 1',
        SECRET_2: 'secret 2'
      })

      expect(mockGetLatestVersion.mock.calls.length).toEqual(4);

      return Promise.all([
        parameterStore.getConfigs([
          'CONFIG_1',
          'CONFIG_2'
        ]),
        parameterStore.getSecrets([
          'SECRET_1',
          'SECRET_2'
        ])
      ])
    })
    .then(([configs, secrets]) => {
      expect(configs).toEqual({
        CONFIG_1: 'config 1',
        CONFIG_2: 'config 2'
      });

      expect(secrets).toEqual({
        SECRET_1: 'secret 1',
        SECRET_2: 'secret 2'
      })

      expect(mockGetLatestVersion.mock.calls.length).toEqual(4);
    })
  });
});





