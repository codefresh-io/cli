const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');


const get = new Command({
    command: 'apply',
    description: 'Apply a configuration to a resource by filename or stdin',
    builder: (yargs) => {
        crudFilenameOption(yargs);

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
