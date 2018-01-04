const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');


const get = new Command({
    root: false, //TODO replace command for now will be ignored. does not bring any value currently
    command: 'describe',
    description: 'Show details of a specific resource or group of resources',
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .usage('Show details of a specific resource or group of resources\n\n' +
                'Available Resources:\n' +
                '  * context\n' +
                '  * pipeline\n' +
                '  * image')
            .example('$0 describe -f ./filename', '# Describe a resource from FILE')
            .example('$0 describe context -f ./filename', '# Describe a context from FILE')
            .example('$0 describe context name', '# Describe a config context by NAME');

        crudFilenameOption(yargs);

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
