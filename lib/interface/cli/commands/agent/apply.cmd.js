const Command = require('../../Command');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');

const applyRoot = require('../root/apply.cmd');
const { ignoreHttpError } = require('../../helpers/general');

const command = new Command({
    command: 'agent [id|name]',
    aliases: [],
    parent: applyRoot,
    description: 'Patch an agent',
    webDocs: {
        category: 'Agents',
        title: 'Patch Agent',
    },
    builder: (yargs) => {
        yargs
            .positional('id|name', {
                describe: 'agent id or name',
            })
            .option('newName', {
                describe: 'New name',
                alias: 'n',
            })
            .option('runtimes', {
                array: true,
                alias: 're',
                describe: 'Agent runtimes',
            })
            .example(
                'codefresh patch agent ID --name NEW_NAME',
                'Replace agent name. Specifying agent by ID',
            )
            .example(
                'codefresh patch agent NAME --re runtime1',
                'Replace agent runtimes. Specifying agent by NAME',
            );

        return yargs;
    },
    handler: async (argv) => {
        const { id, name } = argv;

        const {
            newName,
            runtimes,
        } = argv;

        let agent = await sdk.agents.get({ agentId: id }).catch(ignoreHttpError);
        agent = agent || await sdk.agents.getByName({ name }).catch(ignoreHttpError);
        if (!agent) {
            throw new CFError(`No such agent: "${name || id}"`);
        }

        await sdk.agents.update({ agentId: agent.id }, { name: newName, runtimes });
        console.log(`Agent: "${name || id}" patched.`);
    },
});

module.exports = command;
