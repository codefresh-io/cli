const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');

const annotate = new Command({
    root: true,
    command: 'replace',
    cliDocs: {
        description: 'Replace a resource by filename or stdin',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = annotate;
