/* eslint-disable max-len */
const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const attachRuntimeCmd = require('./attach.cmd');
const installRoot = require('../root/install.cmd');
const { getKubeContext } = require('../../helpers/kubernetes');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');
const createClusterCmd = require('../cluster/create.cmd');
const runCmd = require('../pipeline/run.cmd');
const colors = require('colors');

const defaultNamespace = 'codefresh';
const pipelineName = 'hello_hybrid';

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

const createHelloWorlPipeline = async (runtime) => {
    const pipeline = await sdk.pipelines.create({ metadata: { name: pipelineName } });
    pipeline.spec.runtimeEnvironment = {
        name: runtime,
    };
    pipeline.spec.steps = {};
    pipeline.spec.stages = ['test'];
    pipeline.spec.steps.test = {
        stage: 'test',
        title: 'test',
        image: 'ubuntu:latest',
        commands: ['echo hello hybrid'],
    };

    await sdk.pipelines.replace(
        { name: pipelineName },
        {
            kind: pipeline.kind,
            spec: pipeline.spec,
            metadata: pipeline.metadata,
            version: pipeline.version,
        },
    );
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
        .option('set-value', {
            describe: 'Set values for templates, example: --set-value LocalVolumesDir=/mnt/disks/ssd0/codefresh-volumes',
        })
        .option('set-file', {
            describe: 'Set values for templates from file, example: --set-file Storage.GoogleServiceAccount=/path/to/service-account.json',
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
        .option('cluster-service-account', {
            describe: 'service account for cluster default is default',
        })
        .option('make-default-runtime', {
            describe: 'should all pipelines run on the hybrid runtime (default is false)',
        })
        .option('skip-cluster-test', {
            describe: 'Do not run cluster acceptance test',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'storage-class-name': storageClassName,
            'agent-name': agentName,
            'dry-run': dryRun,
            'in-cluster': inCluster,
            'kube-node-selector': kubeNodeSelector,
            'kubernetes-runner-type': kubernetesRunnerType,
            'runtime-kube-config-path': kubeConfigPath,
            'set-value': setValue,
            'set-file': setFile,
            verbose,
            'build-annotations': buildAnnotations,
            'attach-runtime': attachRuntime,
            'cluster-service-account': clusterServiceAccount,
            'make-default-runtime': shouldMakeDefaultRe,
            terminateProcess,
            createDemoPipeline,
            executeDemoPipeline,
            'skip-cluster-test': skipClusterTest,
        } = argv;

        let {
            'runtime-kube-context-name': kubeContextName,
            'agent-kube-context-name': agentKubeContextName,
            'agent-kube-namespace': agentKubeNamespace,
            'agent-kube-config-path': agentKubeConfigPath,
            'runtime-kube-namespace': kubeNamespace,
            token,
        } = argv;

        if (!kubeNamespace) {
            kubeNamespace = defaultNamespace;
        }

        // parse kubeNodeSelector in form key1=value1,key2=value2 to {key1: value1, key2: value2}
        const kubeNodeSelectorObj = {};
        if (kubeNodeSelector) {
            const nsSplitParts = kubeNodeSelector.split(',');
            nsSplitParts.forEach((nsPart) => {
                const nsRecordSplit = nsPart.split('=');
                if (nsRecordSplit.length !== 2) {
                    throw new Error('invalid kube-node-selector parameter');
                }
                kubeNodeSelectorObj[nsRecordSplit[0]] = nsRecordSplit[1];
            });
        }

        const apiHost = sdk.config.context.url;
        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }
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
            nodeSelector: kubeNodeSelectorObj,
            annotations: buildAnnotations,
            clusterName,
            agent: true,
        });
        console.log(`Runtime envrionment ${colors.blue(runtimeName)} has been created`);
        if (shouldMakeDefaultRe) {
            const re = await sdk.runtimeEnvs.get({
                name: runtimeName,
            });
            await sdk.onPrem.runtimeEnvs.account.setDefault({ account: re.accountId, name: re.metadata.name });
            console.log(`Runtime envrionment ${colors.blue(runtimeName)} has been set to default runtme`);
        }

        // create the cluster in codefresh
        try {
            await createClusterCmd.handler({
                'kube-context': kubeContextName,
                namespace: kubeNamespace,
                'behind-firewall': true,
                serviceaccount: clusterServiceAccount || 'default',
                terminateProcess: false,
            });
        } catch (error) {
            console.log(`Failed to register cluster on codefresh, cause: ${error.message}`);
        }
        if (createDemoPipeline) {
            await createHelloWorlPipeline(runtimeName);
            console.log(`Pipeline  ${colors.blue(pipelineName)} has been created`);
        }
        // install RE on cluster

        const runtimeEvents = new ProgressEvents();
        const runtimeFormat = 'downloading runtime installer  [{bar}] {percentage}% | {value}/{total}';
        const runtimmrProgressBar = new cliProgress.SingleBar({ stopOnComplete: true, format: runtimeFormat }, cliProgress.Presets.shades_classic);
        let runtimeTotalSize;
        runtimeEvents.onStart((size) => {
            console.log('Downloading runtime\'s installer \n');
            runtimmrProgressBar.start(size, 0);
            runtimeTotalSize = size;
        });
        runtimeEvents.onProgress((progress) => {
            runtimmrProgressBar.update(progress);
            if (progress >= runtimeTotalSize) {
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
            kubeNodeSelector,
            setValue,
            setFile,
            terminateProcess: !attachRuntime,
            events: runtimeEvents,
            skipClusterTest,
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
                terminateProcess,
            });
            if (attachRuntimeStatusCode !== 0) {
                throw new Error(`Attach runtime failed with exit code ${attachRuntimeStatusCode}`);
            }
            if (executeDemoPipeline) {
                console.log(`Executing pipeline  ${colors.blue(pipelineName)}`);
                await runCmd.handler({
                    name: pipelineName,
                    exitProcess: false,
                });
            }
        } else {
            console.log('Please run agent attach in order to link agent and runtime');
        }
    },
});


module.exports = installRuntimeCmd;
