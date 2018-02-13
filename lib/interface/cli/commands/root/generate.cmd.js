const Command = require('../../Command');
const yargs = require('yargs');

const get = new Command({
    root: true,
    command: 'generate',
    description: 'Generate resources as Kubernetes image pull secret and Codefresh Registry token',
    usage: 'Codefresh generate --help',
    webDocs: {
        description: 'Generate resources for external use',
        category: '----',
        title: 'Generate',
    },
    builder: () => {
        yargs
            .example('codefresh generate imagePullSecret --help', 'See how to generate image pull secret from integrated registy in Codefresh');
        return yargs;
    },
    handler: async () => {
        yargs.showHelp();
    },
});

module.exports = get;
