const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const { workflow  } = require('../../../../logic').api;
const getRoot = require('../root/restart.cmd');

const command = new Command({
    command: 'workflows <id>',
    aliases: ['wf', 'workflow'],
    description: 'Restart workflow',
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        await workflow.restartWorkflowById(workflowId);
    },
});
getRoot.subCommand(command);


module.exports = command;
