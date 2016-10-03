# Codefresh command line manager
This package provides a unified command line interface to Codefresh.

## Installation

```
$ npm install -g @codefresh-io/cf-cli
```

* [Template of Commands](#command)
* [Login](#login)
* [Builds](#builds)
* [Images](#images)
* [Compositions](#compositions)
* [Environments](#environments)
* [Help](#help)

<a name="command"/>
## Template of Commands

The template for running commands looks like this

```
$ cf-cli <command> <subcommand> [options]
```

<a name="login" />
## Login

```
$ cf-cli login -h
$ cf-cli login -u <user> --token <token>
```

| Option         | Alias | Demand | Type | Description |
| -------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --pwd            | -p    |          | string | password |
| --user           | -u    | required | string | username |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

<a name="builds"/>
## Builds

```
$ cf-cli builds -h
$ cf-cli builds <sub-command> [options]
```

| Sub-command | Description |
| ----------- |:-----------|
| ls | list of builds |
| build | trigger build |

```
$ cf-cli builds ls [options]
```

| Option         | Alias | Demand | Type | Description |
| ---------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --account        | -a    | required | string | name of account |
| --repo           | -r    | required | string | name of repository |
| --repoOwner      | -o    | required | string | repository owner |
| --type           | -t    |          | string | type of build [yml, normal]; default: "normal" |
| --limit          |       |          | number | number of builds |
| --tofile         |       |          | string | output to file |
| --table          |       |          | boolean | output as table to console |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

```
$ cf-cli builds build [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --account        | -a    | required | string | name of account |
| --repo           | -r    | required | string | name of repository |
| --repoOwner      | -o    | required | string | repository owner |
| --pipelineName   |       | required | string | name of pipeline |
| --branch         |       | required | string | branch |
| --sha            |       |          | string | id of commit |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

<a name="images"/>
## Images

```
$ cf-cli images <sub-command> [options]
```

| Sub-command | Description |
| ----------- |:-----------|
| ls      | list of images |
| get     | get image by id |
| getTags | get list of tags |

```
$ cf-cli images ls [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --limit          |       |          | number | number of images |
| --tofile         |       |          | string | save result to file |
| --table          |       |          | boolean | output as table to console |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

```
$ cf-cli images get [options]
```

| Option         | Alias | Demand | Type | Description |
| ---------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --id             |       | required | string | id of the image |
| --tofile         |       |          | string | save result to file |
| --table          |       |          | boolean | output as table to console |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

```
$ cf-cli images getTags [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --imageName      |       | required | string | name of the image |
| --tofile         |       |          | string | save result to file |
| --table          |       |          | boolean | output as table to console |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

<a name="compositions"/>
## Compositions

```
$ cf-cli compositions <sub-command> [options]
```

| Sub-command | Description |
| ----------- |:-----------|
| ls     | list of compositions |
| create | create a new composition |
| remove | delete composition |
| run    | launch a composition |

```
$ cf-cli compositions ls [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --tofile         |       |          | string | save result to file |
| --table          |       |          | boolean | output as table to console |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

```
$ cf-cli compositions create [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --tofile         |       |          | string | save result to file |
| --file           |       | required | string | path to <file>.json. Content of the file in the format {"isAdvanced":false,"vars":[{"key":"test_key","value":"test_value"}],"yamlJson":"path to your composition.yml","name":"string"} |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

```
$ cf-cli compositions remove [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --id             |       | required | string | id of composition |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

```
$ cf-cli compositions run [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --id             |       | required | string | id of composition |
| --vars           |       |          | string | composition variables. Format [{"key":"","value":""}]; default: [] |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

<a name="environments"/>
## Environments

```
$ cf-cli environments <sub-command> [options]
```

| Sub-command | Description |
| ----------- |:-----------|
| ls           | list of environments |
| start        | start environment |
| stop         | stop environment |
| status       | get current status of environment |
| pause        | pause environment |
| unpause      | unpause environment |
| terminate    | terminate environment by id |
| terminateAll | terminate all environments |

```
$ cf-cli environments ls [options]
$ cf-cli environments terminateAll [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |

```
$ cf-cli environments start [options]
$ cf-cli environments stop [options]
$ cf-cli environments pause [options]
$ cf-cli environments unpause [options]
$ cf-cli environments status [options]
$ cf-cli environments terminate [options]
```

| Option         | Alias | Demand | Type | Description |
| ----------------  |:-----:|:------:|:----:|:-----------|
| --token          |       |          | string | access token |
| --id             |       | required | string | id of environment |
| --tokenFile      |       |          | string | access token file, default: "$HOME.codefresh/accessToken.json" |
| --logLevel       | --log |          | string | choices: "error", "info", "debug"; default: "error" |
| --help           | -h    |          | boolean | show list of options for command |


<a name="help"/>
## Help

To see help text, you can run:

```
$ cf-cli --help
$ cf-cli <command> --help
$ cf-cli <command> <sub-command> --help
```
