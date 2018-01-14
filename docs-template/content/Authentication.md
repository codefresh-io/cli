---
title: Authentication
---

# Authentication

## create-context

### Command
`codefresh auth create-context [name]`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
name | default | Context name
### Options

Option | Default | Description
--------- | ----------- | -----------
--url | https://g.codefresh.io | Codefresh system custom url
--api-key |  | API key
## current-context

### Command
`codefresh auth current-context`

undefined
## get-contexts

### Command
`codefresh auth get-contexts`

undefined
## Login

### Command
`codefresh auth login <username> <password>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
username |  | username
password |  | password
### Options

Option | Default | Description
--------- | ----------- | -----------
--url | https://g.codefresh.io | Codefresh system custom url
## use-context

### Command
`codefresh auth use-context <name>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
context-name |  | a context-name that exists in cfconfig file
