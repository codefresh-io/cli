const Command = require('../../Command');
const { crudFilenameOption , callToSubCommandHandler } = require('../../helpers/general');


const apply = new Command({
    root: true,
    command: 'patch',
    cliDocs: {
        description: 'Patch a resource by filename or stdin',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);

        return yargs;
    },
    handler: (argv) => {
        callToSubCommandHandler(argv, apply);
    },
});

module.exports = apply;
