const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { environment } = require('../../../../logic').api;


const command = new Command({
    command: 'environment <id>',
    description: 'Describe an environment',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'environment id',
            });
    },
    handler: async (argv) => {
        const id = argv.filename ? _.get(argv.filename, 'id') : argv.id;
        const currEnvironment = await environment.getEnvironmentById(id);
        console.log(currEnvironment.describe());
    },
});

module.exports = command;
