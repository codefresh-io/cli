+++
title = "Spec"
+++

A Pipeline needs `.apiVersion`, `.kind`, and `.metadata` fields. 

A Pipeline also needs a `.spec` section.

### Examples

#### Pipeline which is stored entirely in Codefresh
```yaml
apiVersion: "v1"
kind: "pipeline"
metadata:
  name: "new-pipeline"
  description: "my description"
  labels:
    repo: "ArikMaor/ping-server"
    key1: "value1"
    project: "asd"
    
spec:
  triggers:
    - type: "scm"
      repo: "ArikMaor/ping-server"
      events: ["push", "pullrequest"]
      branchRegex: '.'
  contexts: []
  variables:
    - key: "PORT"
      value: 3000
      encrypted: false
    - key: "PAPA"
      value: "BLA BLA"
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

#### Pipeline which is stored on a remote git
```yaml
apiVersion: "v1"
kind: "pipeline"
metadata:
  name: "ew-pipeline-git"
  labels:
    repo: "ArikMaor/ping-server"
spec:
  triggers:
    - type: "scm"
      repo: "ArikMaor/ping-server"
      events: ["push", "pullrequest"]
      branchRegex: '.'
  contexts: []
  variables:
    - key: "PORT"
      value: 3000
      encrypted: false
    - key: "PAPA"
      value: "BLA BLA"
      encrypted: true
  source:
    location: "git"
    repo: "codefresh-io/cli"
    path: "codefresh.yml"
```

#### Pipeline which is stored on a specific url
```yaml
apiVersion: "v1"
kind: "pipeline"
metadata:
  name: "new-pipeline-url"
  labels:
    repo: "codefresh-io/cli"
spec:
  triggers:
    - type: "scm"
      repo: "ArikMaor/ping-server"
      events: ["push", "pullrequest"]
      branchRegex: '.'
  contexts: []
  variables:
    - key: "PORT"
      value: 3000
      encrypted: false
    - key: "PAPA"
      value: "BLA BLA"
      encrypted: true
  source:
    location: "url"
    url: "https://raw.githubusercontent.com/codefresh-io/cli/master/codefresh.yml"
```
