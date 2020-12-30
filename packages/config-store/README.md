# Parameter Store Reader

Reads parameters from specified provider

## Installation

```
# Via yarn
$ yarn add @adikari/config-store

# Via npm
$ npm install @adikari/config-store
```


## Examples

### SSM Provider
Add IAM policy to allow getting parameters from ssm.

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
const { makeConfigStore } = require('@adikari/config-store');
const { STAGE } = process.env;

const configStore = makeConfigStore({
  configPath: `/${SERVICE_STAGE}/foo-service/config`,
  secretPath: `/${SERVICE_STAGE}/foo-service/secret`,
  provider: {
    name: 'ssm'
  }
});

return Promise.all([
  configStore.getConfigs([
    'THE_CONFIG_1',
    'THE_CONFIG_2'
  ]),
  configStore.getSecrets([
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
Add IAM policy to allow getting parameters from dynamodb.

```yml
provider:
  name: aws
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query # Allow Parameter Store to be read
      Resource:
        - arn:aws:dynamodb:${env:AWS_REGION}:${env:AWS_ACCOUNT_ID}:table/config-service*
```
```js
const { makeConfigStore } = require('@adikari/config-store');
const { STAGE } = process.env;

const configStore = makeConfigStore({
  configPath: `/${SERVICE_STAGE}/foo-service/config`,
  secretPath: `/${SERVICE_STAGE}/foo-service/secret`,
  provider: {
    tableName: `config-service-${SERVICE_STAGE}`
  }
});

return Promise.all([
  configStore.getConfigs([
    'THE_CONFIG_1',
    'THE_CONFIG_2'
  ]),
  configStore.getSecrets([
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

