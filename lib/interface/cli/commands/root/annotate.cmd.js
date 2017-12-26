const Command = require('../../Command');

const annotate = new Command({
    root: true,
    command: 'annotate',
    description: 'Annotate a resource with labels',
    builder: (yargs) => {
        return yargs
            .usage('Annotate a resource with labels\n\n' +
                'Available Resources:\n' +
                '  * image')
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = annotate;
