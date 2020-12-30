const mockQuery = jest.fn();

const AWS = require('aws-sdk');
AWS.DynamoDB.DocumentClient.mockImplementation(function () {
  return {
    query: mockQuery
  };
});

const { makeGetLatestVersion } = require('./make-get-latest-version');
const getLatestVersion = makeGetLatestVersion({ tableName: 'the-test-table' });

describe('getLatestVersion', () => {
  describe('when the parameter does not exist', () => {
    beforeAll(() => {
      mockQuery.mockImplementation(() => ({
        promise: () => Promise.resolve({
          Items: []
        })
      }));
    });

    it('should throw an error indicating that the param could not be fetched', () => {
      expect.assertions(1);

      return expect(getLatestVersion({ parameterName: 'theParam' }))
      .rejects.toEqual(new Error('Unable to fetch theParam, Original Error: Query did not return a result'));
    });
  });

  describe('when the parameter exist', () => {
    let promise;
    beforeAll(() => {
      mockQuery.mockImplementation(() => ({
        promise: () => Promise.resolve({
          Items: [
            {
              name: 'theParameter',
              value: 'theValue',
              version: '0000000001'
            }
          ]
        })
      }));

      promise = getLatestVersion({ parameterName: 'theParam' });
      return promise;
    });

    it('should retrieve the parameter', () => {
      expect.assertions(1);

      return promise
        .then(parameter => {
          expect(parameter).toEqual({
            name: 'theParameter',
            value: 'theValue',
            version: '0000000001'
          });
        });
    });

    it('should get the latest version', () => {
      expect.assertions(1);

      return promise
        .then(() => {
          expect(mockQuery.mock.calls[0][0]).toEqual({
            Limit: 1,
            ScanIndexForward: false,
            KeyConditionExpression: '#name = :name',
            ExpressionAttributeNames: {
              '#name': 'name'
            },
            ExpressionAttributeValues: {
              ':name': 'theParam'
            }
          });
        });
    });
  });

  describe('when the parameter cannot be retrieved', () => {
    beforeAll(() => {
      mockQuery.mockImplementation(() => ({
        promise: () => Promise.reject(new Error('AWS broke'))
      }));
    });

    it('should throw an error indicating that the param could not be fetched', () => {
      expect.assertions(1);

      return expect(getLatestVersion({ parameterName: 'theParam' }))
      .rejects.toEqual(new Error('Unable to fetch theParam, Original Error: AWS broke'));
    });
  });
});