/* eslint-disable max-len */
const _ = require('lodash');
const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');


const attachAgentToRuntime = async (agent, runtime) => {
    const runtimes = _.get(agent, 'runtimes', []);
    const existingRT = _.find(runtimes, value => value === runtime);
    if (!existingRT) {
        runtimes.push(runtime);
        await sdk.agents.update({ agentId: agent.id, runtimes });
    }
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
        .option('runtime-kube-context-name', {
            describe: 'Runtime kubernetes context',
        })
        .option('runtime-kube-namespace', {
            describe: 'Runtime\'s namespace',
        })
        .option('runtime-kube-config-path', {
            describe: 'Path to kubeconfig file for runtime (default is $HOME/.kube/config)',
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
            'runtime-kube-context-name': kubeContextName,
            'runtime-kube-namespace': kubeNamespace,
            'runtime-kube-config-path': kubeConfigPath,
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

        await attachAgentToRuntime(agent, runtimeName);

        // call venonactl to attach

        const events = new ProgressEvents();
        const format = 'downloading [{bar}] {percentage}% | {value}/{total}';
        const progressBar = new cliProgress.SingleBar({ stopOnComplete: true, format }, cliProgress.Presets.shades_classic);
        let totalSize;
        events.onStart((size) => {
            progressBar.start(size, 0);
            totalSize = size;
        });
        events.onProgress((progress) => {
            progressBar.update(progress);
            if (progress >= totalSize) {
                console.log('\n');
            }
        });
        await sdk.runtime.attach({
            kubeContextName,
            kubeNamespace,
            kubeConfigPath,
            agentKubeContextName,
            agentKubeNamespace,
            agentKubeConfigPath,
            runtimeName,
            verbose,
            restartAgent,
            terminateProcess: false,
            events,
        });
        if (!restartAgent) {
            console.log('Please restart agent\'s pod in order that changes will take effect');
        }
        if (terminateProcess || terminateProcess === undefined) {
            process.exit();
        }
    },
});


module.exports = attachRuntimeCmd;
