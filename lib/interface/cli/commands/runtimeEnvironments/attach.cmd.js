const _ = require('lodash');
const Command = require('../../Command');
const { sdk } = require('../../../../logic');

async function attachInPlatform(argv) {
    const {
        agentName,
        agentId,
        runtimeName,
    } = argv;
    let agent;
    if (_.isEmpty(runtimeName)) {
        throw new Error('runtime name is mandatory');
    }

    if (agentName) {
        agent = await sdk.agents.getByName({ name: agentName });
    } else if (agentId) {
        agent = await sdk.agents.get({ agentId });
    } else {
        throw new Error('agent name or agent id is needed');
    }

    if (agent === '' || !agent) {
        throw new Error('agent was not found');
    }

    const rt = await sdk.runtimeEnvs.get({ name: runtimeName });
    if (!rt) {
        throw new Error(`runtime ${runtimeName} does not exist on the account`);
    }

    if (!rt.metadata.agent) {
        throw new Error('cannot attach non hybrid runtime');
    }

    const runtimes = _.get(agent, 'runtimes', []);
    const existingRT = _.find(runtimes, (value) => value === runtimeName);
    if (!existingRT) {
        runtimes.push(runtimeName);
        await sdk.agents.update({ agentId: agent.id, runtimes });
    }
}

const attachRuntimeCmd = new Command({
    root: true,
    command: 'attach runtime',
    description: 'Attach a runtime to agent in the Codefresh platform',
    usage: 'attach runtime',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Attach Runtime-Environments',
        weight: 100,
    },
    builder: (yargs) => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('runtime-name', {
            describe: 'Runtime\'s name',
        })
        .option('agent-name', {
            describe: 'Agent\'s name',
        })
        .option('agent-id', {
            describe: 'Agent\'s ID',
        })
        .option('platform-only', {
            describe: 'Deprecated, has no effect: runtime is always attached on the platform side only',
        }),
    handler: async (argv) => {
        const { terminateProcess } = argv;

        await attachInPlatform(argv);

        if (terminateProcess || terminateProcess === undefined) {
            process.exit();
        }
    },
});

module.exports = attachRuntimeCmd;
