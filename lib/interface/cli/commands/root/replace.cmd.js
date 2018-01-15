const Command = require('../../Command');
const { crudFilenameOption, callToSubCommandHandler } = require('../../helpers/general');

const replace = new Command({
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
    handler: (argv) => {
        callToSubCommandHandler(argv, replace);
    },

});

module.exports = replace;
