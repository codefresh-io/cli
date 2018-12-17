const Command = require('../../Command');

const add = new Command({
    root: true,
    command: 'add',
    description: 'Add a resource',
    usage: 'codefresh add --help',
    webDocs: {
        title: 'Add',
        weight: 70,
    },
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = add;
