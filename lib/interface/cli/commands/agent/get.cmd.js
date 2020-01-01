const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const Agent = require('../../../../logic/entities/Agent');
const Output = require('../../../../output/Output');
const _ = require('lodash');
const { ignoreHttpError } = require('../../helpers/general');

const getRoot = require('../root/get.cmd');

const command = new Command({
    command: 'agents [id|name]',
    aliases: ['agent'],
    parent: getRoot,
    description: 'Get a specific agent or an array of agents',
    webDocs: {
        category: 'Agents',
        title: 'Get Agents',
    },
    builder: yargs => yargs
        .positional('id|name', {
            describe: 'Agent id or name to get one agent',
        })
        .option('name', {
            alias: 'n',
            describe: 'Agent name to filter by',
        }),
    handler: async (argv) => {
        const { id, name } = argv; // eslint-disable-line

        let agents;
        if (id) {
            let agent = await sdk.agents.get({ agentId: id }).catch(ignoreHttpError);
            agent = agent || await sdk.agents.getByName({ name }).catch(ignoreHttpError);
            agents = agent ? [agent] : [];
        } else {
            agents = await sdk.agents.list({
                name,
            });
        }
        Output.print(_.map(agents, Agent.fromResponse));
    },
});

module.exports = command;
