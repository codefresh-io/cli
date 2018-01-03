[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=codefresh-io&repoName=cli&branch=master&pipelineName=build&accountName=codefresh-inc&type=cf-1)]( https://g.codefresh.io/repositories/codefresh-io/cli/builds?filter=trigger:build;branch:master;service:5a4c94b54e6e5f0001c4f913~build)
# Codefresh CLI
This packages provides a CLI for interacting with Codefresh <br />
You can also requires this module to be used in node.js and the browser

# Installation Instructions
## Install from official releases
<a href="https://github.com/codefresh-io/cli/releases" target="_blank">Official Releases</a>

## Install via npm
`npm install -g codefresh`

## Install via yarn
`yarn global add codefresh`

# Installing bash completions
Run `/usr/local/bin/codefresh completion >> ~/.bashrc`. <br />
If you are on OSX run `/usr/local/bin/codefresh completion >> ~/.bash_profile`

# Creating authentication context
In order to start working with the cli you will need to update the authentication configuration. <br />
You can find your access token through our swagger documentation `https://g.codefresh.io/api/` <br />
Once you have the token create a new context: `codefresh auth create-context first-context --token {TOKEN}`
