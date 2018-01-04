const debug = require('debug')('codefresh:cli:logs');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { logs } = require('../../../../logic').api;


const run = new Command({
    root: true,
    command: 'logs <id>',
    description: 'Show logs of a workflow',
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'Pipeline id',
            })
            .option('f', {
                describe: 'Continue showing workflow logs until it will finish',
                type: 'boolean',
            });

        return yargs;
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        const follow = argv.f;

        await logs.showWorkflowLogs(workflowId, follow);
        // TODO fix this. its a workaround since something related to firebase in not properly closed
        process.exit(0);
    },
});

module.exports = run;
