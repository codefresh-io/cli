const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const getAgents = require('../agent/get.cmd');


const command = new Command({
    command: 'info',
    parent: runnerRoot,
    description: 'Get info on your runner installations',
    webDocs: {
        category: 'Runner',
        title: 'Info',
    },
    handler: async () => {
        await getAgents.handler({});
    },
});

module.exports = command;
