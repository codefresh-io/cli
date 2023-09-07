const Command = require('../../Command');

const unassign = new Command({
    root: true,
    command: 'unassign',
    description: 'Unassign a resource',
    usage: 'codefresh assign --help',
    webDocs: {
        title: 'Unassign',
        weight: 70,
    },
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = unassign;
