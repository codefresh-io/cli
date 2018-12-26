const Command = require('../../Command');
const yargs = require('yargs');

const get = new Command({
    root: true,
    command: 'recreate',
    description: 'Recreate a resource',
    usage: 'codefresh recreate --help',
    webDocs: {
        description: 'Recreate a resource',
        title: 'Recreate',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
