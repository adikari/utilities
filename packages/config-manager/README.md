# 🗄️ Config Manager

Node module to push configuration and encrypted secrets to AWS.

## Installation

```
# Via yarn
$ yarn add @adikari/config-manager

# Via npm
$ npm install @adikari/config-manager
```

## Usage

1. At the root of your application add configuration file called `configs.yml`.

```
service: my-service
provider: ssm

config:
  path: /${stage}/config
  defaults:
    DB_NAME: my-database
    DB_HOST: 3200
  required:
    DB_TABLE: "some database table name for ${stage}"

secret:
  path: /${stage}/secret
  required:
    DB_PASSWORD: "secret database password"
```

2. Use `config-manager` CLI tool to push your keys to AWS parameter store.

```
$ config-manager run --stage <stage> --interactive
```

### Config File

Following is the configuration file will all possible options:


```
service: my-service
provider: ssm                                 # Only supports ssm for now.

cfOutputs:                                    # Outputs from cloudformation stacks that needs to be pushed to ssm.
  - some-cloudformation-stack

config:
  path: /${stage}/config                      # Base path for params to be added to
  defaults:                                   # Default parameters. Can be overwritten in different environments.
    DB_NAME: my-database
    DB_HOST: 3200
  production:                                 # If keys are deployed to production stage, its value will be overwritten by following
    DB_NAME: my-production-database
  required:                                   # Keys mentioned below will be prompted to be entered.
    DB_TABLE: "some database table name for ${stage}"

secret:
  keyId: some-arn-of-kms-key-to-use .         # If not specified, default key will be used to encrypt variables.
  path: /${stage}/secret                      # Base path for params to be added to
  required:
    DB_PASSWORD: "secret database password" . # Parameter to encrypt and add to. Will be encrypted using KMS.
                                              # Above key will be added to /${stage}/secret/DB_PASSWORD
                                              # Value in quote will be displayed as explanation in prompt during interactive run.
```

### CLI

Following is the usage of `config-manager` CLI.

```
Usage: config-manager [options] [command]

Options:
  -V, --version          output the version number
  -s, --stage [stage]    Specify stage to run on. (required)
  -c, --config [config]  Path to configuration (default: "configs.yml")
  -h, --help             output usage information

Commands:
  run [options]          Verify or populate all remote configurations and secrets.
  init                   Initialize config manager. Only required to run once.
  list                   List all remote configurations and secrets.

```

### License

Feel free to use the code, it's released using the MIT license.
