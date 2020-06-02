/* eslint-disable max-len */
const Command = require('../../Command');
const unInstallRoot = require('../root/uninstall.cmd');
const { sdk } = require('../../../../logic');
const { getKubeContext } = require('../../helpers/kubernetes');
const _ = require('lodash');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');
const { DefaultLogFormatter } = require('./../hybrid/helper');


const detachRuntimeFromAgent = async (agent, runtimeName) => {
    const { runtimes } = agent;
    const runtimeIdx = runtimes.findIndex(re => re === runtimeName);
    runtimes.splice(runtimeIdx, 1);
    await sdk.agents.update({ agentId: agent.id, runtimes });
};

const unInstallRuntimeCmd = new Command({
    root: false,
    parent: unInstallRoot,
    command: 'runtime',
    description: 'Uninstall a runtime on kubernetes cluster',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Uninstall Runtime-Environment',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('agent-name', {
            describe: 'Agent\'s name to be uninstalled',
        })
        .option('name', {
            describe: 'Runtime\'s name to be uninstalled',
        })
        .option('agent-id', {
            describe: 'Agent\'s ID',
        })
        .option('runtime-kube-context-name', {
            describe: 'Name of the kubernetes context on which venona should be uninstalled [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('runtime-kube-namespace', {
            describe: 'Name of the namespace on which venona should be uninstalled [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('runtime-kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
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
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'agent-name': agentName,
            'agent-id': agentId,
            name: runtimeName,
            'runtime-kube-namespace': kubeNamespace,
            'runtime-kube-config-path': kubeConfigPath,
            'restart-agent': restartAgent,
            'agent-kube-config-path': agentKubeConfigPath,
            verbose,
            terminateProcess,

        } = argv;

        let {
            'runtime-kube-context-name': kubeContextName,
            'agent-kube-context-name': agentKubeContextName,
            'agent-kube-namespace': agentKubeNamespace,
        } = argv;

        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }
        if (!agentKubeContextName) {
            agentKubeContextName = getKubeContext(agentKubeConfigPath);
        }
        if (!agentKubeNamespace) {
            agentKubeNamespace = kubeNamespace;
        }

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

        const runtimes = _.get(agent, 'runtimes', []);
        if (!_.find(runtimes, value => value === runtimeName)) {
            throw new Error(`Runtime ${runtimeName} is not attached to agent ${agent.name}`);
        }
        const runtimeIns = await sdk.runtimeEnvs.get({ name: runtimeName });
        const storageClassName = _.get(runtimeIns, 'RuntimeScheduler.Pvcs.Dind.StorageClassName');
        await detachRuntimeFromAgent(agent, runtimeName);

        // Get agent

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

        await sdk.runtime.unInstall({
            runtimeName,
            kubeContextName,
            kubeNamespace,
            kubeConfigPath,
            agentKubeContextName,
            agentKubeNamespace,
            agentKubeConfigPath,
            restartAgent,
            storageClassName,
            verbose,
            terminateProcess: (terminateProcess !== false),
            events,
            logFormatting: DefaultLogFormatter,
        });
    },
});

module.exports = unInstallRuntimeCmd;
