+++
title = "Execute a pipeline"
+++

### Command
`codefresh run <id>`

Run a pipeline and attach the created workflow logs.<br />Returns an exit code according to the workflow finish status (Success: 0, Error: 1, Terminated: 2).
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
--detach |  | Run pipeline and print build ID
--variable-file |  | Set build variables from a file
