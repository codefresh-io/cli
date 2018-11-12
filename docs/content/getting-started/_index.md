+++
title = "Getting Started"
description = ""
date = "2017-04-24T18:36:24+02:00"
weight = 10
+++

## Install
Install the CLI through one of the possible ways described in the [Installation](/cli/installation) page.

## Authenticate
In order to start working with the cli you will need to update the authentication configuration. <br />
Updating the authentication configuration is done via an API-KEY you generate from Codefresh. <br />

If you already have an API-KEY you can just use it.<br />
You can generate a new one from the <a href="https://g.codefresh.io/account-conf/tokens" target="_blank">account settings</a> page. <br />
{{% alert theme="warning" %}}You must be an account admin to generate api keys{{% /alert %}}
 
Once you have an API key, create a new authentication context:<br> `codefresh auth create-context --api-key {API_KEY}`

## Getting Help
To get help and usage instructions run `codefresh [COMMAND]--help`.<br />
A help message will appear in the terminal.<br />

## Showing Current Version
Run `codefresh version` to see the current CLI version.

<br />
#### That's it, you are good to go!
