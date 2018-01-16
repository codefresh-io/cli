+++
title = "Update a single pipeline"
+++

### Command
`codefresh patch pipeline <id>`

Apply changes to a pipeline
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | pipeline id
repo-owner |  | repository owner
repo-name |  | repository name
### Options

Option | Default | Description
--------- | ----------- | -----------
--context |  | context in form of: type=name
--engine-cluster |  | K8 cluster name to use for execution
--engine-namespace |  | K8 namespace in the chosen cluster to use for execution
--default-engine |  | Use the default engine configured by the system
