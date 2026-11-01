+++
title = "Getting Started"
description = ""
date = "2017-04-24T18:36:24+02:00"
weight = 10
+++

## Install
Install the CLI through one of the possible ways described in the [Installation](/cli/installation) page.

## Authenticate
In order to start working with the cli you will need to update the authentication configuration.

Updating the authentication configuration is done via an API-KEY you generate from Codefresh.

If you already have an API-KEY you can just use it.

You can generate a new one from the [user settings](https://g.codefresh.io/user/settings) page.

Once you have an API key, create a new authentication context:

`codefresh auth create-context --api-key {API_KEY}`

Please note, if you have an environment variable called 'CF_API_KEY', the API key in this environment variable will take precedence over the context configured for the CLI. <br />

## Getting Help
To get help and usage instructions run `codefresh [COMMAND]--help`.

A help message will appear in the terminal.

## Showing Current Version
Run `codefresh version` to see the current CLI version.

#### That's it, you are good to go!
