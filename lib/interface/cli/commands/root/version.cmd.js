const Command = require('../../Command');
const cliPackage = require('./../../../../../package.json');

const version = new Command({
    root: true,
    command: 'version',
    description: 'Print version',
    builder: (yargs) => {
        return yargs;
    },
    handler: async () => {
        console.log(cliPackage.version);
    },
});

module.exports = version;
