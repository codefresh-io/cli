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
    usage: 'attach runtime',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Attach Runtime-Environments',
        weight: 100,
    },
    builder: yargs => yargs
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
        .option('kube-context-name', {
            describe: 'Runtime kubernetes context',
        })
        .option('kube-namespace', {
            describe: 'Runtime\'s namespace',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file for runtime (default is $HOME/.kube/config)',
        })
        .option('kube-service-account', {
            describe: 'Runtime service account , deafult is "default"',
        })
        .option('agent-kube-context-name', {
            describe: 'Agent kubernetes context',
        })
        .option('agent-kube-namespace', {
            describe: 'Agent\'s namespace',
        })
        .option('agent-kube-config-path', {
            describe: 'Path to kubeconfig file for the agent (default is $HOME/.kube/config)',
        })
        .option('restart-agent', {
            describe: 'restart agent afte install - default false',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'agent-name': agentName,
            'runtime-name': runtimeName,
            'agent-id': agentId,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'kube-config-path': kubeConfigPath,
            'kube-service-account': serviceAccount,
            'agent-kube-context-name': agentKubeContextName,
            'agent-kube-namespace': agentKubeNamespace,
            'agent-kube-config-path': agentKubeConfigPath,
            'restart-agent': restartAgent,
            verbose,

        } = argv;
        const { terminateProcess } = argv;
        let agent;
        if (_.isNull(runtimeName) || _.isUndefined(runtimeName) || runtimeName === '') {
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
                restartAgent,
                terminateProcess: false,
            });
            if (!restartAgent) {
                console.log('Please restart agent\'s pod in order that changes will take effect');
            }
        } else {
            console.log(`Runtime environment ${runtimeName} is already attached to agent`);
        }
        if (terminateProcess || terminateProcess === undefined) {
            process.exit();
        }
    },
});


module.exports = attachRuntimeCmd;
