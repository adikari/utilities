const mockListParameters = jest.fn();
const mockGetParameters = jest.fn(() =>
  Promise.resolve({
    john: 'doe',
    steph: 'curry'
  })
);

jest.mock('../../services/parameter-store/make-parameter-store', () => ({
  makeParameterStore: () => ({
    getParameters: mockGetParameters
  })
}));

jest.mock('./list-parameters', () => ({
  listParameters: mockListParameters
}));

const path = require('path');

const { makeConfigManager } = require('../../make-config-manager');

describe('list', () => {
  let promise;

  const configManager = makeConfigManager({
    stage: 'testing',
    config: path.resolve(__dirname, '../../../mocks/ssm-provider.yml')
  });

  beforeAll(() => {
    promise = configManager.list();
  });

  it('should retrieve configs', () => {
    expect.assertions(1);

    return promise.then(() => {
      expect(mockGetParameters.mock.calls[0][0]).toEqual({
        parameterNames: [
          '/testing/config/DB_NAME',
          '/testing/config/DB_HOST',
          '/testing/config/DB_TABLE'
        ]
      });
    });
  });

  it('should list configs', () => {
    expect.assertions(1);

    return promise.then(() => {
      expect(mockListParameters.mock.calls[0][0]).toEqual({
        parameters: {
          john: 'doe',
          steph: 'curry'
        }
      });
    });
  });

  it('should retrieve secrets', () => {
    expect.assertions(1);

    return promise.then(() => {
      expect(mockGetParameters.mock.calls[1][0]).toEqual({
        parameterNames: ['/testing/secret/DB_PASSWORD']
      });
    });
  });

  it('should list secrets', () => {
    expect.assertions(1);

    return promise.then(() => {
      expect(mockListParameters.mock.calls[1][0]).toEqual({
        parameters: {
          john: 'doe',
          steph: 'curry'
        },
        mask: true
      });
    });
  });
});

