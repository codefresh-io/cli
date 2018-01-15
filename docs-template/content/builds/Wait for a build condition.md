+++
title = "Wait for a build condition"
+++

### Command
`codefresh wait <id..>`

Wait until a condition will be met on a build
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
