const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');


const get = new Command({
    command: 'get',
    description: 'Display one or many resources',
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .usage('Display one or many resources\n\n' +
                'Available Resources:\n' +
                '  * contexts\n' +
                '  * pipelines\n' +
                '  * environments\n' +
                '  * compositions\n' +
                '  * workflows\n' +
                '  * images')
            .example('$0 get contexts', '# List all contexts')
            .example('$0 get contexts context-name', '# List a single context with specified NAME')
            .option('output', {
                describe: 'Output format',
                alias: 'o',
                choices: ['json', 'yaml', 'wide', 'name'],
            })
            .option('watch', {
                describe: 'watch',
                type: Boolean,
                default: false,
            });

        crudFilenameOption(yargs);

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
