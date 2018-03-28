+++
title = "Spec"
+++

A Pipeline needs `.version`, `.kind`, and `.metadata` fields. 

A Pipeline also needs a `.spec` section.

### Examples

#### Basic Pipeline
```yaml
version: "1.0"
kind: "pipeline"
metadata:
  name: "basic-pipeline"
  description: "my description"
  labels:
    key1: "value1"
    key2: "value2"
spec:
  triggers:
    - type: "git"
      kind: "github"
      repo: "codefresh-io/cli"
      events: ["push"]
      branchRegex: '.'
  contexts: []
  variables:
    - key: "PORT"
      value: 3000
      encrypted: false
    - key: "SECRET"
      value: "secret-value"
      encrypted: true
  steps:
    clone_step:
      repo: github.com/itai-codefresh/test-env-file
      revision: master
    test_step_1:
      image: "alpine"
      working_directory: ${{clone_step}}
      commands:
      - echo ls
      - echo "hello world"
      - echo "plain value $PORT"
      - echo "encrypted value $PAPA"
      - echo "value from context $COOKIE"
    build:
      type: build
      working_directory: ${{clone_step}}
      dockerfile: ./Dockerfile
      image_name: itai/test
      tag: bla
  
```

#### Pipeline with a remote spec template brought from a git repository
```yaml
version: "1.0"
kind: "pipeline"
metadata:
  name: "my-pipeline-1"
spec:
  triggers:
    - type: "git"
      kind: "github"
      repo: "codefresh-io/cli"
      events: ["push", "pullrequest"]
      branchRegex: '.'
  contexts: []
  variables:
    - key: "PORT"
      value: 3000
      encrypted: false
    - key: "SECRET"
      value: "secret-value"
      encrypted: true
  specTemplate:
    location: "git"
    repo: "codefresh-io/cli"
    path: "codefresh.yml"
```

#### Pipeline with a remote spec template brought from a git repository
```yaml
version: "1.0"
kind: "pipeline"
metadata:
  name: "my-pipeline-1"
spec:
  triggers:
    - type: "git"
      kind: "github"
      repo: "codefresh-io/cli"
      events: ["push", "pullrequest"]
      branchRegex: '.'
  contexts: []
  variables:
    - key: "PORT"
      value: 3000
      encrypted: false
    - key: "SECRET"
      value: "secret-value"
      encrypted: true
  specTemplate:
    location: "url"
    url: "https://raw.githubusercontent.com/codefresh-io/cli/master/codefresh.yml"
```
