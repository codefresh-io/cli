const Command = require('../../Command');
const cliPackage = require('./../../../../../package.json');

const version = new Command({
    root: true,
    requiresAuthentication: false,
    command: 'version',
    cliDocs: {
        description: 'Print version',
    },
    builder: (yargs) => {
        return yargs;
    },
    handler: async () => {
        console.log(cliPackage.version);
    },
});

module.exports = version;
