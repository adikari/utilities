# Parameter Store Reader

Reads parameters from specified provider

## Examples

### SSM Provider
In serverless.yml

```yml
provider:
  name: aws
  iamRoleStatements:
    - Effect: Allow
      Action:
        - ssm:GetParameters # Allow Parameter Store to be read
      Resource:
        - arn:aws:ssm:${env:AWS_REGION}:${env:AWS_ACCOUNT_ID}:parameter/staging/foo-service/*
```
```js
const { makeParameterStore } = require('@a-cloud-guru/parameter-store');
const { STAGE } = process.env;

const parameterStore = makeParameterStore({
  configPath: `/${SERVICE_STAGE}/foo-service/config`,
  secretPath: `/${SERVICE_STAGE}/foo-service/secret`,
  provider: {
    name: 'ssm'
  }
});

return Promise.all([
  parameterStore.getConfigs([
    'THE_CONFIG_1',
    'THE_CONFIG_2'
  ]),
  parameterStore.getSecrets([
    'THE_SECRET_1'
  ])
])
.then(([configs, secrets]) => ({ ...configs, ...secrets }))
.then(console.log);

/* console.log output
{
  THE_CONFIG_1: 'the config 1',
  THE_CONFIG_2: 'the config 2',
  THE_SECRET_1: 'the secret 1'
};
*/
```

### DynamoDB Provider
In serverless.yml

```yml
provider:
  name: aws
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query # Allow Parameter Store to be read
      Resource:
        - arn:aws:dynamodb:${env:AWS_REGION}:${env:AWS_ACCOUNT_ID}:table/oprah-foo-service*
```
```js
const { makeParameterStore } = require('@a-cloud-guru/parameter-store');
const { STAGE } = process.env;

const parameterStore = makeParameterStore({
  configPath: `/${SERVICE_STAGE}/foo-service/config`,
  secretPath: `/${SERVICE_STAGE}/foo-service/secret`,
  provider: {
    tableName: `oprah-foo-service-${SERVICE_STAGE}`
  }
});

return Promise.all([
  parameterStore.getConfigs([
    'THE_CONFIG_1',
    'THE_CONFIG_2'
  ]),
  parameterStore.getSecrets([
    'THE_SECRET_1'
  ])
])
.then(([configs, secrets]) => ({ ...configs, ...secrets }))
.then(console.log);

/* console.log output
{
  THE_CONFIG_1: 'the config 1',
  THE_CONFIG_2: 'the config 2',
  THE_SECRET_1: 'the secret 1'
};
*/
```

