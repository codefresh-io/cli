+++
title = "Delete a helm release"
+++

### Command
`codefresh delete-release [name]`

Delete a helm release
### Options

Option | Default | Description
--------- | ----------- | -----------
--cluster |  | Run on cluster
--timeout | 300 | time in seconds to wait for any individual kubernetes operation (like Jobs for hooks) (default 300)
--purge |  | remove the release from the store and make its name free for later use (default true)
--detach |  | Run pipeline and print build ID
--no-hooks |  | prevent hooks from running during deletion
