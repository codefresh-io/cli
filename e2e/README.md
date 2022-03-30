# Codefresh Cli E2E

Account -- codefresh-cli-e2e

If you want to debug e2e:
1) enable debug on the `build` pipeline
2) put breakpoint after `e2e_tests` step
3) then you can see logs of each test under `/codefresh/volume/cli/e2e/scenarios`

##### Note: try to create projects that do not contain same words (like _cli-e2e_ and _cli-e2e_-test)
