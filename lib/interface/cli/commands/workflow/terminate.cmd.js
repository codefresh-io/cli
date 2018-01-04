const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const { workflow , pipeline } = require('../../../../logic').api;
const getRoot = require('../root/terminate.cmd');

const command = new Command({
    command: 'workflows <id>',
    aliases: ['wf', 'workflow'],
    description: 'Terminate workflow',
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        await workflow.terminateWorkflowById(workflowId);
    },
});
getRoot.subCommand(command);


module.exports = command;
