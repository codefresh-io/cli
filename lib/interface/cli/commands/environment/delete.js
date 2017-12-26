const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { environment } = require('../../../../logic').api;

const command = new Command({
    command: 'environment <id>',
    description: 'get-contexts',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Environment id',
            });
    },
    handler: async (argv) => {
        const id = argv.id;
        await environment.deleteEnvironment(id);
        console.log(`Environment: ${id} deleted`);
    },
});


module.exports = command;
