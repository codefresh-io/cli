# Codefresh CLI
This packages provides a CLI for interacting with Codefresh <br />
You can also requires this module to be used in node.js and the browser

# Install via npm
`npm install -g codefresh`

# Install via yarn
`yarn global add codefresh`

# Creating authentication context
In order to start working with the cli you will need to update the authentication configuration. <br />
You can find your access token through our swagger documentation `https://g.codefresh.io/api/` <br />
Once you have the token create a new context: `codefresh auth create-context first-context --token {TOKEN}`