+++
title = "Spec"
+++

A Pipeline needs `.version`, `.kind`, and `.metadata` fields. 

A Pipeline also needs a `.spec` section.

### Examples

#### Basic Pipeline with implicit clone step (will checkout connected repo automatically)

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: codefresh-io/cli/default-pipeline
  labels:
    tags: []
  deprecate:
    applicationPort: '8080'
    repoPipeline: true
spec:
  triggers:
    - type: git
      repo: codefresh-io/cli
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: github
  contexts: []
  variables:
    - key: PORT
      value: '3000'
    - key: SECRET
      value: 'secret-value'
      encrypted: true
  steps:
    test_step_1:
      image: alpine
      working_directory: '${{clone_step}}'
      commands:
        - echo ls
        - echo "hello world"
        - echo "plain value $PORT"
        - echo "encrypted value $PAPA"
        - echo "value from context $COOKIE"
    build:
      type: build
      working_directory: '${{clone_step}}'
      dockerfile: ./Dockerfile
      image_name: my-custom-docker-image
      tag: foo
  stages: []
```

#### Basic Pipeline with explicit clone step 

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: codefresh-io/cli/basic-pipeline
  labels:
    tags: []
  deprecate:
    applicationPort: '8080'
    repoPipeline: true
spec:
  triggers:
    - type: git
      repo: codefresh-io/cli
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: github
  contexts: []
  variables:
    - key: PORT
      value: '3000'
    - key: SECRET
      value: 'secret-value'
      encrypted: true
  steps:
    clone_step:
      repo: codefresh-contrib/python-flask-sample-app
      revision: master
      type: git-clone
      git: CF-default
    test_step_1:
      image: alpine
      working_directory: '${{clone_step}}'
      commands:
        - echo ls
        - echo "hello world"
        - echo "plain value $PORT"
        - echo "encrypted value $PAPA"
        - echo "value from context $COOKIE"
    build:
      type: build
      working_directory: '${{clone_step}}'
      dockerfile: ./Dockerfile
      image_name: my-custom-docker-image
      tag: bla
  stages: []
```

#### Pipeline with a remote spec template brought from a git repository
```yaml
version: '1.0'
kind: pipeline
metadata:
  name: codefresh-io/cli/from-repo
  isPublic: false
  labels:
    tags: []
  deprecate:
    applicationPort: '8080'
    repoPipeline: true
spec:
  triggers:
    - type: git
      repo: codefresh-io/cli
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: github
  contexts: []
  variables:
    - key: PORT
      value: '3000'
    - key: SECRET
      value: 'secret-value'
      encrypted: true
  specTemplate:
    location: git
    repo: codefresh-io/cli
    path: codefresh.yml
  steps: {}
  stages: []
```

#### Pipeline with a remote spec template brought from a git repository
```yaml
version: '1.0'
kind: pipeline
metadata:
  name: codefresh-io/cli/from-external
  isPublic: false
  labels:
    tags: []
  deprecate:
    applicationPort: '8080'
    repoPipeline: true
  project: codefresh-io/cli
spec:
  triggers:
    - type: git
      repo: codefresh-io/cli
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: github
  contexts: []
  variables:
    - key: PORT
      value: '3000'
    - key: SECRET
      value: 'secret-value'
      encrypted: true
  specTemplate:
    location: url
    url: 'https://raw.githubusercontent.com/codefresh-io/cli/master/codefresh.yml'
  steps: {}
  stages: []
```
