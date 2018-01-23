const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');


const get = new Command({
    root: true,
    command: 'delete',
    description: 'Delete a resource by file or resource name',
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
