const Command = require('../../Command');

const annotate = new Command({
    root: true,
    command: 'synchronize',
    description: 'Synchronize a resource',
    webDocs: {
        title: 'synchronize',
        weight: 100,
    },
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = annotate;
