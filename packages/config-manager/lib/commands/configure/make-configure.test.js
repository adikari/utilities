const Bluebird = require('bluebird');
const mockPromptRequiredConfigs = jest.fn(() => Promise.resolve());
const mockUpdateSecrets = jest.fn(() => Promise.resolve());
const mockUpdateConfigs = jest.fn(() => Promise.resolve());
const AWS = require('aws-sdk');

AWS.CloudFormation.mockImplementation(function() {
  return {
    describeStacks: jest.fn(() => ({
      promise: () =>
        Bluebird.resolve({
          Stacks: [
            {
              Outputs: [
                {
                  OutputKey: 'Domain',
                  OutputValue: 'some-domain.com'
                }
              ]
            }
          ]
        })
    }))
  };
});

mockPromptRequiredConfigs
  .mockImplementationOnce(() =>
    Promise.resolve({
      config1: '1',
      config2: '2'
    })
  )
  .mockImplementationOnce(() =>
    Promise.resolve({
      secret1: '1'
    })
  );

jest.mock('./make-prompt-required-configs', () => ({
  makePromptRequiredConfigs: () => mockPromptRequiredConfigs
}));

jest.mock('../../services/parameter-store/make-parameter-store', () => ({
  makeParameterStore: () => ({
    updateSecrets: mockUpdateSecrets,
    updateConfigs: mockUpdateConfigs
  })
}));

const path = require('path');

const { makeConfigManager } = require('../../make-config-manager');

describe('run', () => {
  let promise;

  const configManager = makeConfigManager({
    stage: 'testing',
    config: path.resolve(__dirname, '../../../mocks/ssm-provider.yml')
  });

  beforeAll(() => {
    promise = configManager.run();
  });

  it('should prompt users for config if required', () => {
    return promise.then(() => {
      expect(mockPromptRequiredConfigs.mock.calls[0][0]).toEqual({
        interactive: false,
        missingOnly: false,
        parameterNames: [
          '/testing/config/DB_NAME',
          '/testing/config/DB_HOST',
          '/testing/config/DB_TABLE'
        ],
        required: {
          DB_TABLE: 'some database table name for testing'
        }
      });
    });
  });

  it('should prompt users for secrets if required', () => {
    return promise.then(() => {
      expect(mockPromptRequiredConfigs.mock.calls[1][0]).toEqual({
        interactive: false,
        missingOnly: false,
        parameterNames: ['/testing/secret/DB_PASSWORD'],
        required: {
          DB_PASSWORD: 'secret database password'
        }
      });
    });
  });

  it('should update the parameter store with the merged config from the prompt and parameter store', () => {
    return promise.then(() => {
      expect(mockUpdateConfigs.mock.calls[0][0]).toEqual({
        parameters: {
          '/testing/config/DB_HOST': '3200',
          '/testing/config/DB_NAME': 'my-database',
          '/testing/config/config1': '1',
          '/testing/config/config2': '2'
        }
      });
    });
  });

  it('should update the parameter store with the secrets from the prompt', () => {
    return promise.then(() => {
      expect(mockUpdateSecrets.mock.calls[0][0]).toEqual({
        parameters: {
          '/testing/secret/secret1': '1'
        }
      });
    });
  });
});
