+++
title = "Test a helm release"
+++

### Command
`codefresh test-release [name]`

Test a helm release
### Options

Option | Default | Description
--------- | ----------- | -----------
--cluster |  | Install on cluster
--timeout | 300 | time in seconds to wait for any individual kubernetes operation (like Jobs for hooks) (default 300)
--cleanup | false | delete test pods upon completion (default false)
