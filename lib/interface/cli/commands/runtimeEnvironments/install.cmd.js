/* eslint-disable max-len */
const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const attachRuntimeCmd = require('./attach.cmd');
const installRoot = require('../root/install.cmd');
const { getKubeContext } = require('../../helpers/kubernetes');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');


const _getAgentData = async (token) => {
    // take the agent id from the token
    const apiKey = token.split('.')[0];
    const agentKey = await sdk.tokens.getById({ id: apiKey });
    if (!agentKey) {
        throw new Error('token is not valid');
    }
    const { subject } = agentKey;

    if (subject.type !== 'agent') {
        throw new Error('token is not assosicated with agent');
    }
    const agentId = agentKey.subject.ref;
    const agentData = await sdk.agents.get({ agentId });
    if (!agentData || agentData === '') {
        throw new Error('failed to get agent data');
    }
    return agentData;
};


const installRuntimeCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'runtime',
    description: 'Install and create a runtime on kubernetes cluster',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Install Runtime-Environment',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('token', {
            describe: 'Agent\'s token',
        })
        .option('agent-name', {
            describe: 'Agent\'s name',
        })
        .option('storage-class-name', {
            describe: 'Set a name of your custom storage class, note: this will not install volume provisioning components',
        })
        .option('runtime-kube-context-name', {
            describe: 'Name of the kubernetes context on which the runtime should be installed (default is current-context) [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-node-selector', {
            describe: 'The kubernetes node selector "key=value" to be used by venona build resources (default is no node selector) (string)',
        })
        .option('dry-run', {
            describe: 'Set to true to simulate installation',
        })
        .option('in-cluster', {
            describe: 'Set flag if venona is been installed from inside a cluster',
        })
        .option('runtime-kube-namespace', {
            describe: 'Name of the namespace on which runtime should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kubernetes-runner-type', {
            describe: 'Set the runner type to kubernetes (alpha feature)',
        })
        .option('build-annotations', {
            describe: 'The kubernetes metadata.annotations as "key=value" to be used by venona build resources (default is no node selector)',
        })
        .option('runtime-kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('attach-runtime', {
            describe: 'if set to true, auto attach runtime to agent (need to provide ....)',
        })
        .option('agent-kube-namespace', {
            describe: 'Agent\'s namespace',
        })
        .option('agent-kube-config-path', {
            describe: 'Path to kubeconfig file for the agent (default is $HOME/.kube/config)',
        })
        .option('agent-kube-context-name', {
            describe: 'Agent kubernetes context (on attach)',
        })
        .option('agent-kube-namespace', {
            describe: 'Agent\'s namespace (on attach)',
        })
        .option('agent-kube-config-path', {
            describe: 'Path to kubeconfig file for the agent (default is $HOME/.kube/config) (on attach)',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'storage-class-name': storageClassName,
            'agent-name': agentName,
            'runtime-kube-context-name': kubeContextName,
            'dry-run': dryRun,
            'runtime-kube-namespace': kubeNamespace,
            'in-cluster': inCluster,
            'kube-node-selector': kubeNodeSelector,
            'kubernetes-runner-type': kubernetesRunnerType,
            'runtime-kube-config-path': kubeConfigPath,
            verbose,
            'build-annotations': buildAnnotations,
            'attach-runtime': attachRuntime,
        } = argv;

        let {
            'agent-kube-context-name': agentKubeContextName,
            'agent-kube-namespace': agentKubeNamespace,
            'agent-kube-config-path': agentKubeConfigPath,
            token,
        } = argv;
        const apiHost = sdk.config.context.url;
        const clusterName = kubeContextName || getKubeContext(kubeConfigPath);
        const runtimeName = `${clusterName}/${kubeNamespace}`;

        if (!token) {
            // eslint-disable-next-line prefer-destructuring
            token = sdk.config.context.token;
        }

        // create RE in codefresh
        await sdk.cluster.create({
            namespace: kubeNamespace,
            storageClassName,
            runnerType: kubernetesRunnerType,
            nodeSelector: kubeNodeSelector,
            annotations: buildAnnotations,
            clusterName,
            agent: true,
        });
        console.log(`Runtime envrionment ${runtimeName} was created`);
        // install RE on cluster

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

        const installRuntimeExitCode = await sdk.runtime.install({
            apiHost,
            name: runtimeName,
            kubeContextName,
            kubeNamespace,
            token,
            dryRun,
            inCluster,
            kubernetesRunnerType,
            kubeConfigPath,
            verbose,
            terminateProcess: !attachRuntime,
            events,
        });
        // attach RE to agent in codefresh

        if (installRuntimeExitCode !== 0) {
            throw new Error(`Runtime envrionment install failed with exit code ${installRuntimeExitCode}`);
        }

        if (attachRuntime) {
            // set defaults for agent options
            if (!agentKubeNamespace) {
                agentKubeNamespace = kubeNamespace;
            }
            if (!agentKubeContextName) {
                agentKubeContextName = kubeContextName;
            }
            if (!agentKubeConfigPath) {
                agentKubeConfigPath = kubeConfigPath;
            }

            const attachRuntimeStatusCode = await attachRuntimeCmd.handler({
                'agent-name': agentName,
                'runtime-name': runtimeName,
                'runtime-kube-context-name': kubeContextName,
                'runtime-kube-namespace': kubeNamespace,
                'runtime-kube-config-path': kubeConfigPath,
                'agent-kube-context-name': agentKubeContextName,
                'agent-kube-namespace': agentKubeNamespace,
                'agent-kube-config-path': agentKubeConfigPath,
                'restart-agent': true,
                terminateProcess: true,
            });
            if (attachRuntimeStatusCode !== 0) {
                throw new Error(`Attach runtime failed with exit code ${attachRuntimeStatusCode}`);
            }
        } else {
            console.log('Please run agent attach in order to link agent and runtime');
        }
    },
});


module.exports = installRuntimeCmd;
