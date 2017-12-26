const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');


const get = new Command({
    root: true,
    command: 'create',
    description: 'Create a resource from a file or from stdin',
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .example('$0 create -f ./filename', '# Create a resource from FILE')
            .example('$0 create context -f ./filename', '# Create a context from FILE')
            .example('$0 create context config name -v key1=value2', '# Create a config context by NAME with a variable');

        crudFilenameOption(yargs);

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
