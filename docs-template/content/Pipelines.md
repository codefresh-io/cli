---
title: Pipelines
---

# Pipelines

## Apply changes to a pipeline

### Command
`codefresh patch pipeline <id|name> [repo-owner] [repo-name]`

Apply changes to a pipeline
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | pipeline id or name
repo-owner |  | repository owner
repo-name |  | repository name
### Options

Option | Default | Description
--------- | ----------- | -----------
--context |  | context in form of: type=name
--engine-cluster |  | K8 cluster name to use for execution
--engine-namespace |  | K8 namespace in the chosen cluster to use for execution
--default-engine |  | Use the default engine configured by the system
## Describe a pipeline

### Command
`codefresh describe pipeline <id|name> [repo-owner] [repo-name]`

Describe a pipeline
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | pipeline id or name
repo-owner |  | repository owner
repo-name |  | repository name
## Get all pipelines

### Command
`codefresh get pipelines [id]`

This command will retrieve an array of pipelines according to the passed filters
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Pipeline id
### Options

Option | Default | Description
--------- | ----------- | -----------
--repo-owner |  | Repository owner
--repo-name |  | Repository name
--limit | 25 | Limit amount of returned results
--page | 1 | Paginated page
--name |  | Filter results by pipeline name
## Run a pipeline and attach the created workflow logs.
Returns an exist code according to the workflow finish status (Success: 0, Error: 1, Terminated: 2).

### Command
`codefresh run <id>`

Execute a pipeline
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Pipeline id
### Options

Option | Default | Description
--------- | ----------- | -----------
--branch |  | Branch
--sha |  | Set commit sha
--no-cache |  | Ignore cached images
--reset-volume |  | Reset pipeline cached volume
--variable |  | Set build variables
--scale | 1 | todo
--detach |  | Run pipeline and print build ID
--variable-file |  | Set build variables from a file
## Install or upgrade Helm chart

### Command
`codefresh install-chart`

Install or upgrade Helm chart
### Options

Option | Default | Description
--------- | ----------- | -----------
--cluster |  | Install on cluster
--namespace | default | Install on namespace
--tiller-namespace | kube-system | Where tiller has been installed
--repository |  | Helm repository
--name |  | Name of the chart in the repository
--version |  | Version of the chart in the repository
--context |  | Contexts (plain-yaml) to be passed to the install
--release-name |  | The name to set to the release
