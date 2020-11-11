const Command = require('../../Command');
const CFError = require('cf-errors');
const colors = require('colors');
const { sdk } = require('../../../../logic');
const deleteRoot = require('../root/delete.cmd');
const { ignoreHttpError } = require('../../helpers/general');

const command = new Command({
    command: 'agent <id|name>',
    aliases: [],
    parent: deleteRoot,
    description: 'Delete an agent',
    webDocs: {
        category: 'Agents',
        title: 'Delete Agent',
    },
    builder: (yargs) => {
        yargs
            .positional('id|name', {
                describe: 'agent id or name',
            })
            .example('codefresh delete agent NAME', 'Delete agent by name.')
            .example('codefresh delete agent ID', 'Delete agent by Id.');
        return yargs;
    },
    handler: async (argv) => {
        const { id, name } = argv;

        let agent = await sdk.agents.get({ agentId: id }).catch(ignoreHttpError);
        agent = agent || await sdk.agents.getByName({ name }).catch(ignoreHttpError);
        if (!agent) {
            throw new CFError(`No such agent: "${name || id}"`);
        }

        await sdk.agents.delete({ agentId: agent.id });
        console.log(`Agent "${colors.cyan(name || id)}" deleted.`);
    },
});

module.exports = command;
