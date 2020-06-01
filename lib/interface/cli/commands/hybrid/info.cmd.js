const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const getAgents = require('../agent/get.cmd');
const { getTestPipelineLink, INSTALLATION_DEFAULTS } = require('../hybrid/helper');
const colors = require('colors');


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
        const pipelineLink = await getTestPipelineLink(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME, false);
        if (pipelineLink) {
            // eslint-disable-next-line max-len
            console.log(`\nTest pipeline with the name: '${colors.cyan(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME)}' exists for this account.` +
            `\nWatch it here: ${colors.blue(pipelineLink)}`);
        }
    },
});

module.exports = command;
