const path = require('path');

const mockDeploy = jest.fn(() => Promise.resolve());

jest.mock('../../services/cf/deploy', () => ({
  deploy: mockDeploy
}));

const { makeConfigManager } = require('../../make-config-manager');

describe('init', () => {
  beforeEach(() => {
    mockDeploy.mockClear();
  });

  describe('when the provider is ssm', () => {
    it('should do nothing', () => {
      const configManager = makeConfigManager({
        stage: 'testing',
        config: path.resolve(__dirname, '../../../mocks/ssm-provider.yml')
      });

      expect.assertions(1);

      return configManager.init().then(() => {
        expect(mockDeploy.mock.calls.length).toEqual(0);
      });
    });
  });

  describe('when the provider is ddb', () => {
    it('should create a dynamodb table based on the settings', () => {
      const configManager = makeConfigManager({
        stage: 'testing',
        config: path.resolve(__dirname, '../../../mocks/dynamodb-provider.yml')
      });

      expect.assertions(1);

      return configManager.init().then(() => {
        expect(mockDeploy.mock.calls[0][0]).toEqual({
          name: 'my-table-testing',
          params: {
            TableName: 'my-table-testing'
          },
          template: path.resolve(
            __dirname,
            '../../../cf-templates/dynamodb.yml'
          )
        });
      });
    });
  });
});

