const Command = require('../../Command');

const annotate = new Command({
    root: true,
    command: 'annotate',
    description: 'Annotate a resource with labels',
    webDocs: {
        title: 'annotate',
        weight: 50,
    },
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = annotate;
