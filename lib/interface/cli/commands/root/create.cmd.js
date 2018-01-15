const Command = require('../../Command');
const { crudFilenameOption , callToSubCommandHandler } = require('../../helpers/general');
const CFError = require('cf-errors');
const _ = require('lodash');

const create = new Command({
    root: true,
    command: 'create',
    cliDocs: {
        description: 'Create a resource from a file or from stdin',
    },
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .example('$0 create -f ./filename', '# Create a resource from FILE')
            .example('$0 create context -f ./filename', '# Create a context from FILE')
            .example('$0 create context config name -v key1=value2', '# Create a config context by NAME with a variable');

        crudFilenameOption(yargs);

        return yargs;
    },
    handler: (argv) => {
        callToSubCommandHandler(argv,create);
    },
});


module.exports = create;
