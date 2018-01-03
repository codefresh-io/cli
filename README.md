[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=codefresh-io&repoName=codefresh&branch=master&pipelineName=cli&accountName=codefresh-inc&type=cf-1)]( https://g.codefresh.io/repositories/codefresh-io/codefresh/builds?filter=trigger:build;branch:master;service:5a1925d424a2970001839933~cli)

# Codefresh CLI
This packages provides a CLI for interacting with Codefresh <br />
You can also requires this module to be used in node.js and the browser

# Installation Instructions
## Install from official releases
<a href="https://github.com/codefresh-io/codefresh/releases" target="_blank">Official Releases</a>

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
