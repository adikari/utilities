const mockGetOutputs = jest.fn();
jest.mock('../cf/get-outputs', () => ({
  getOutputs: mockGetOutputs
}));

const path = require('path');
const { makeGetSettings } = require('./make-get-settings');

describe('getSettings', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should throw an error when the provider is valid but the configuration is incorrect', () => {
    const getSettings = makeGetSettings({
      settingsFilePath: path.resolve(
        process.cwd(),
        './mocks/invalid-dynamodb-provider.yml'
      )
    });

    return expect(getSettings()).rejects.toEqual(
      new Error(
        `Invalid provider!! 'provider.tableName' must be passed for 'ddb' provider.`
      )
    );
  });

  it('should throw an error when the provider is invalid', () => {
    const getSettings = makeGetSettings({
      settingsFilePath: path.resolve(
        process.cwd(),
        './mocks/invalid-provider.yml'
      )
    });

    return expect(getSettings()).rejects.toEqual(
      new Error(`Invalid provider 's3'!! Only ssm,ddb are supported.`)
    );
  });

  it('should throw an error if the file type is not supported', () => {
    const getSettings = makeGetSettings({
      settingsFilePath: path.resolve(
        process.cwd(),
        './mocks/invalid-file-type.json'
      )
    });

    return expect(getSettings()).rejects.toEqual(
      new Error(
        `Could not find configs.yml in the following directory - ${process.cwd()}`
      )
    );
  });

  it('should interpolate the yaml file with the variables provided', () => {
    const getSettings = makeGetSettings({
      settingsFilePath: path.resolve(
        process.cwd(),
        './mocks/dynamodb-provider.yml'
      ),
      variables: {
        stage: 'test'
      }
    });

    return getSettings().then(settings => {
      expect(settings).toEqual({
        cfOutputs: ['custom-resources-test', 'test'],
        config: {
          defaults: {
            DB_HOST: '3200',
            DB_NAME: 'my-database'
          },
          path: '/test/config',
          required: {
            DB_TABLE: 'some database table name for test in us-east-1',
            ACCOUNT_ID: '1234'
          }
        },
        configParameters: [
          '/test/config/DB_NAME',
          '/test/config/DB_HOST',
          '/test/config/DB_TABLE',
          '/test/config/ACCOUNT_ID'
        ],
        provider: {
          name: 'ddb',
          tableName: 'my-table-test'
        },
        secret: {
          keyId:
            'arn:aws:kms:us-east-1:1234:key/65def1bd-e786-4334-a17f-4cc0af72fed3',
          path: '/test/secret',
          required: {
            DB_PASSWORD: 'secret database password'
          }
        },
        secretParameters: ['/test/secret/DB_PASSWORD'],
        service: 'my-service'
      });
    });
  });

  it('should interpolate the yaml file with cloudformation outputs', () => {
    mockGetOutputs.mockResolvedValue({ DatabaseName: 'my-database' });
    const getSettings = makeGetSettings({
      settingsFilePath: path.resolve(process.cwd(), './mocks/cf-outputs.yml'),
      variables: {
        stage: 'test'
      }
    });

    return getSettings().then(settings => {
      expect(mockGetOutputs).toHaveBeenCalledWith({
        stackNames: ['custom-resources-test']
      });
      expect(settings).toEqual({
        cfOutputs: ['custom-resources-test'],
        config: {
          defaults: {
            DB_NAME: 'my-database',
            DB_ARN: 'arn-path-my-database'
          },
          path: '/test/config'
        },
        configParameters: ['/test/config/DB_NAME', '/test/config/DB_ARN'],
        provider: {
          name: 'ssm'
        },
        secret: {
          path: '/test/secret',
          required: {
            DB_PASSWORD: 'secret database password'
          }
        },
        secretParameters: ['/test/secret/DB_PASSWORD'],
        service: 'my-service'
      });
    });
  });

  it('should interpolate the yaml file without cloudformation outputs', () => {
    const getSettings = makeGetSettings({
      settingsFilePath: path.resolve(
        process.cwd(),
        './mocks/no-cf-outputs.yml'
      ),
      variables: {
        stage: 'test'
      }
    });

    return getSettings().then(settings => {
      expect(mockGetOutputs).toHaveBeenCalledWith({ stackNames: [] });
      expect(settings).toEqual({
        config: {
          defaults: {
            DB_NAME: 'my-database',
            DB_ARN: 'arn-path-my-database'
          },
          path: '/test/config'
        },
        configParameters: ['/test/config/DB_NAME', '/test/config/DB_ARN'],
        provider: {
          name: 'ssm'
        },
        secret: {
          path: '/test/secret',
          required: {
            DB_PASSWORD: 'secret database password'
          }
        },
        secretParameters: ['/test/secret/DB_PASSWORD'],
        service: 'my-service'
      });
    });
  });
});
