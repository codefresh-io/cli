+++
title = "Spec"
+++

A Pipeline needs `.version`, `.kind`, and `.metadata` fields.

A Pipeline also needs a `.spec` section.

### Examples

Use create/replace/delete commands to manage your pipeline

```shell
# create pipeline
codefresh create -f pipeline.yaml

# get created/modified pipeline spec
codefresh get pipeline <name> -o yaml > pipeline.yaml

# update pipeline with modified pipeline spec
codefresh replace -f pipeline.yaml

# delete pipeline using spec file
codefresh delete -f pipeline.yaml
```

See the examples of pipeline spec below to manage your pipelines.

#### Basic pipeline with cron triggers in spec

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: cron
spec:
  cronTriggers:
    - name: every minute
      type: cron
      message: every minute
      expression: 0/1 * 1/1 * *
  steps:
    test:
      image: alpine
      commands:
        - echo test
```

#### Basic pipeline with cron triggers with variables

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: cron
spec:
  cronTriggers:
    - name: every minute
      type: cron
      message: every minute
      expression: 0/1 * 1/1 * *
      variables:
        - key: TEST_VAR
          value: 'my-test'
  steps:
    test:
      image: alpine
      commands:
        - echo ${{TEST_VARIABLE}}
```

#### Basic pipeline with cron triggers with run options

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: cron
spec:
  cronTriggers:
    - name: every minute
      type: cron
      message: every minute
      expression: 0/1 * 1/1 * *
      options:
        resetVolume: true
  steps:
    test:
      image: alpine
      commands:
        - echo test >> test.txt
        - cat test.txt
```

#### Pipeline started by cron trigger but simulating the git trigger

Note that `spec.triggers.0.id` and `spec.cronTriggers.gitTriggerId` 
should be the same value and a valid ObjectId.

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: cron
spec:
  triggers:
    - type: git
      name: test
      repo: repo-owner/repo-name
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: git-context-name
      id: 65329431edb87250ff128acc

  cronTriggers:
    - name: every minute
      type: cron
      message: every minute
      expression: 0/1 * 1/1 * *
      gitTriggerId: 65329431edb87250ff128acc
      branch: master

  steps:
    test:
      image: alpine
      commands:
        - echo ${{CF_BRANCH}}
```

#### **Disable** cron trigger in pipeline

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: cron
spec:
  cronTriggers:
    - name: every minute
      type: cron
      message: every minute
      expression: 0/1 * 1/1 * *
      disabled: true
  steps:
    test:
      image: alpine
      commands:
        - echo test
```

#### Basic Pipeline with clone step and git trigger

```yaml
version: '1.0'
kind: pipeline
metadata:
  name: basic-pipeline
spec:
  triggers:
    - type: git
      name: test
      repo: repo-owner/repo-name
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: git-context-name
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
```

#### Pipeline with a remote spec template brought from a git repository
```yaml
version: '1.0'
kind: pipeline
metadata:
  name: basic-pipeline
spec:
  triggers:
    - type: git
      name: test
      repo: repo-owner/repo-name
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: git-context-name
  contexts: []
  variables:
    - key: PORT
      value: '3000'
    - key: SECRET
      value: 'secret-value'
      encrypted: true
  specTemplate:
    location: git
    context: git-context-name # if not specified will use the default git-context
    repo: codefresh-io/cli
    path: codefresh.yml
    revision: master # can be a branch or commit. if not specified will use CF_BRANCH variable value
```

#### Pipeline with a remote spec template from a public git URL
```yaml
version: '1.0'
kind: pipeline
metadata:
  name: basic-pipeline
spec:
  triggers:
    - type: git
      name: test
      repo: repo-owner/repo-name
      events:
        - push.heads
      pullRequestAllowForkEvents: false
      commentRegex: /.*/gi
      branchRegex: /.*/gi
      branchRegexInput: regex
      provider: git-context-name
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
```
