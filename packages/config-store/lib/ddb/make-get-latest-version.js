const get = require('lodash.get');
const { makeDdbClient } = require('./make-ddb-client');

const makeGetLatestVersion =
  ({ tableName }) => {
    const ddb = makeDdbClient({ tableName });
    return ({ parameterName }) => {
      return ddb.query({
        Limit: 1,
        ScanIndexForward: false,
        KeyConditionExpression: '#name = :name',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': parameterName
        }
      })
      .promise()
      .then(res => {
        const Item = get(res, 'Items.0');
        if (!Item) {
          throw new Error('Query did not return a result');
        }

        return Item;
      })
      .catch(err => {
        const errorMessage = get(err, 'message') || '';
        throw new Error(`Unable to fetch ${parameterName}, Original Error: ${errorMessage}`);
      });
    }
  };

module.exports = {
  makeGetLatestVersion
};
