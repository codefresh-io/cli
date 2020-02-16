/* eslint-disable max-len */
const _ = require('lodash');
const Command = require('../../Command');
const { sdk } = require('../../../../logic');


const attachAgentToRuntime = async (agent, runtime) => {
    const runtimes = _.get(agent, 'runtimes', []);
    const existingRT = _.find(runtimes, value => value === runtime);
    if (!existingRT) {
        runtimes.push(runtime);
        await sdk.agents.update({ agentId: agent.id, runtimes });
        return true;
    }
    return false;
};

const attachRuntimeCmd = new Command({
    root: true,
    command: 'attach runtime',
    description: 'Attach a runtime to agent',
    usage: 'attach runtime [$RUNTIME_NAME] [$AGENT_ID]',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Attach Runtime-Environments',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .positional('runtimeName', {
            describe: 'Runtime\'s name',
        })
        .option('agentName', {
            alias: 'agent-name',
            describe: 'Agent\'s name',
        })
        .option('agentId', {
            alias: 'agent-id',
            describe: 'Agent id',
        })
        .option('kubeContextName', {
            alias: 'kube-context-name',
            describe: 'Runtime kubernetes context',
        })
        .option('kubeNamespace', {
            alias: 'kube-namespace',
            describe: 'Runtime\'s namespace',
        })
        .option('kubeConfigPath', {
            alias: 'kube-config-path',
            describe: 'Path to kubeconfig file for runtime (default is $HOME/.kube/config)',
        })
        .option('serviceAccount', {
            alias: 'kube-service-account',
            describe: 'Runtime service account , deafult is "default"',
        })
        .option('agentKubeContextName', {
            alias: 'agent-kube-context-name',
            describe: 'Agent kubernetes context',
        })
        .option('agentKubeNamespace', {
            alias: 'agent-kube-namespace',
            describe: 'Agent\'s namespace',
        })
        .option('agentKubeConfigPath', {
            alias: 'agent-kube-config-path',
            describe: 'Path to kubeconfig file for the agent (default is $HOME/.kube/config)',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            agentName, runtimeName, agentId, kubeContextName,
            kubeNamespace, kubeConfigPath, serviceAccount,
            agentKubeContextName, agentKubeNamespace, agentKubeConfigPath,
            verbose,

        } = argv;
        const { terminateProcess } = argv;
        let agent;
        if (agentName) {
            agent = await sdk.agents.getByName({ name: agentName });
        } else if (agentId) {
            agent = await sdk.agents.get({ agentId });
        } else {
            throw new Error('agent name or agent id is needed');
        }

        const shouldAttach = await attachAgentToRuntime(agent, runtimeName);

        // call venonactl to attach

        if (shouldAttach) {
            await sdk.runtime.attach({
                kubeContextName,
                kubeNamespace,
                kubeConfigPath,
                serviceAccount,
                agentKubeContextName,
                agentKubeNamespace,
                agentKubeConfigPath,
                runtimeName,
                verbose,
                terminateProcess: false,
            });
            console.log('Please restart agent\'s pod in order that changes will take effect');
        } else {
            console.log(`Runtime environment ${runtimeName} is already attached to agent`);
        }
        if (terminateProcess || terminateProcess === undefined) {
            process.exit();
        }
    },
});


module.exports = attachRuntimeCmd;
