const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { workflow } = require('../../../../logic').api;
const describeRoot = require('../root/describe.cmd');

const command = new Command({
    command: 'workflow <id>',
    description: 'Describe a workflow',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'workflow id',
            });
    },
    handler: async (argv) => {
        const id = argv.filename ? _.get(argv.filename, 'id') : argv.id;
        const currWorkflow = await workflow.getWorkflowById(id);
        console.log(currWorkflow.describe());
    },
});
describeRoot.subCommand(command);


module.exports = command;

