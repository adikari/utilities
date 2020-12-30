const path = require('path');

const mockMakeSettingsService = jest.fn(() => ({}));
const mockMakeConfigure = jest.fn(() => () => ({}));

jest.mock('./services/settings/make-settings-service', () => ({
  makeSettingsService: mockMakeSettingsService
}));

jest.mock('./commands/configure/make-configure', () => ({
  makeConfigure: mockMakeConfigure
}));

const { makeConfigManager } = require('./make-config-manager');

describe('makeConfigManager', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should resolve the config path if it is provided', () => {
    makeConfigManager({
      stage: 'test',
      config: './hello.yml'
    });

    const expectedPath = path.resolve(process.cwd(), './hello.yml');

    expect(mockMakeSettingsService.mock.calls[0][0].settingsFilePath).toEqual(
      expectedPath
    );
  });

  it('should default the config path to configs.yml when it is not provided', () => {
    makeConfigManager({
      stage: 'test'
    });

    const expectedPath = path.resolve(process.cwd(), './configs.yml');

    expect(mockMakeSettingsService.mock.calls[0][0].settingsFilePath).toEqual(
      expectedPath
    );
  });

  it('should merge the stage into variables', () => {
    makeConfigManager({
      stage: 'test',
      variables: {
        hello: 'world'
      }
    });

    expect(mockMakeSettingsService.mock.calls[0][0].variables).toEqual({
      hello: 'world',
      stage: 'test'
    });
  });

  it('should default to non-interactive mode', () => {
    makeConfigManager({
      stage: 'test',
      variables: {
        hello: 'world'
      }
    }).configure();

    expect(mockMakeConfigure.mock.calls[0][0].interactive).toEqual(false);
  });

  it('should run in interactive mode if interactive flag is specified', () => {
    makeConfigManager({
      stage: 'test',
      variables: {
        hello: 'world'
      },
      interactive: true
    }).configure();

    expect(mockMakeConfigure.mock.calls[0][0].interactive).toEqual(true);
  });
});
