# Codefresh-cli
[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=codefresh-io&repoName=cli&branch=master&pipelineName=build&accountName=codefresh-inc&type=cf-1)]( https://g.codefresh.io/repositories/codefresh-io/cli/builds?filter=trigger:build;branch:master;service:5a4c94b54e6e5f0001c4f913~build)

Codefresh CLI provides a full and flexible interface to interact with Codefresh.

![demo](cli.gif)

## Install
In case you have node.js installed you can easily install with NPM.

`npm install -g codefresh`

For other installation possibilities check out the <a href="http://cli.codefresh.io/installation" target="_blank">installation documentation</a>.

## Authenticate
Generate a new api key from the <a href="https://g.codefresh.io/account-conf/tokens" target="_blank">account settings</a> page.

`codefresh auth create-context --api-key {{API_KEY}}`

## Usage
```$xslt
codefresh <command>

Commands:
  codefresh completion             generate bash completion script
  codefresh tag <id> [tags..]      Add an image tag.
  codefresh untag <id> [tags..]    Untag an image.
  codefresh annotate               Annotate a resource with labels.
  codefresh patch                  Patch a resource by filename or stdin.
  codefresh auth                   Manage authentication contexts.
  codefresh create                 Create a resource from a file or stdin.
  codefresh delete                 Delete a resource by file or resource name.
  codefresh generate               Generate resources as Kubernetes image pull secret and Codefresh Registry token.
  codefresh get                    Display one or many resources.
  codefresh replace                Replace a resource by filename.
  codefresh version                Print version.
  codefresh logs <id>              Show logs of a build.
  codefresh restart <id>           Restart a build by its id.
  codefresh terminate <id>         Terminate a build by its id.
  codefresh wait <id..>            Wait until a condition will be met on a build.
  codefresh run <name>             Run a pipeline by id or name and attach the created workflow logs.
  codefresh delete-release [name]  Delete a helm release from a kubernetes cluster.
  codefresh install-chart          Install or upgrade a Helm chart Repository flag can be either absolute url or saved repository in Codefresh.
  codefresh test-release [name]    Test a helm release.

Options:
  --cfconfig  Custom path for authentication contexts config file  [default: "/Users/itaigendler/.cfconfig"]
  --help      Show help  [boolean]
```

## Documentation
For more information please visit the official <a href="http://cli.codefresh.io" target="_blank">CLI documentation</a> site.

