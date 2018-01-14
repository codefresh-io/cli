---
title: Builds
---

# Builds

## Describe a build

### Command
`codefresh describe build <id>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | build id
## Get builds

### Command
`codefresh get builds [id]`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Build id
### Options

Option | Default | Description
--------- | ----------- | -----------
--limit | 25 | Limit amount of returned results
--page | 1 | Paginated page
--status |  | Filter results by statuses
--trigger |  | Filter results by triggers
--pipeline-id |  | Filter results by pipeline id
--pipeline-name |  | Filter results by pipeline name
## Show logs of a build

### Command
`codefresh logs <id>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Pipeline id
### Options

Option | Default | Description
--------- | ----------- | -----------
--f |  | Continue showing build logs until it will finish
## Restart a build by its id

### Command
`codefresh restart <id>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Build id
### Options

Option | Default | Description
--------- | ----------- | -----------
--detach |  | Run build and print workflow ID
## Terminate a build by its id

### Command
`codefresh terminate <id>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Build id
## Wait until a condition will be met on a build

### Command
`codefresh wait <id..>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Build id
### Options

Option | Default | Description
--------- | ----------- | -----------
--status |  | Build status
--debug |  | Show debug output until the condition will be met
--timeout | 30 | Define a timeout for the wait operation in minutes
