const Command = require('../../Command');
const yargs = require('yargs');

const get = new Command({
    root: true,
    command: 'generate',
    description: 'Generate resources as Kubernetes image pull secret and Codefresh Registry token',
    usage: 'Codefresh generate --help',
    handler: async () => {
        yargs.showHelp();
    },
});

module.exports = get;
