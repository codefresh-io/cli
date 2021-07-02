/* eslint-disable max-len */
const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const attachRuntimeCmd = require('./attach.cmd');
const installRoot = require('../root/install.cmd');
const { getKubeContext } = require('../../helpers/kubernetes');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');
const createClusterCmd = require('../cluster/create.cmd');
const colors = require('colors');
const _ = require('lodash');
const { DefaultLogFormatter, INSTALLATION_DEFAULTS } = require('./../hybrid/helper');

const defaultNamespace = 'codefresh';
const defaultStorageClassPrefix = 'dind-local-volumes-runner';
const maxRuntimeNameLength = 63;

async function newRuntimeName(kubeContextName, kubeNamespace) {
    const defaultName = `${kubeContextName}/${kubeNamespace}`.slice(0, maxRuntimeNameLength);
    const runtimes = await sdk.runtimeEnvs.list({ });
    let name;

    if (!_.isArray(runtimes) || !_.find(runtimes, re => _.get(re, 'metadata.name') === defaultName)) {
        name = defaultName; // use the default name if there are no collisions
    } else {
        const reNames = new Set(_.map(runtimes, re => _.get(re, 'metadata.name'))); // for fast lookup
        let i = 1;
        let suggestName;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            suggestName = `${defaultName.slice(0, maxRuntimeNameLength - 1 - i.toString().length)}_${i}`;
            if (!reNames.has(suggestName)) {
                break;
            }
            i += 1;
        }
        name = suggestName;
    }

    return name;
}
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
            describe: 'The kubernetes node selector "key=value" to be used by runner build resources (default is no node selector) (string)',
        })
        .option('docker-registry', {
            describe: 'The prefix for the container registry that will be used for pulling the required components images. Example: --docker-registry="docker.io"',
            type: 'string',
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
            describe: 'Set flag if runner is been installed from inside a cluster',
        })
        .option('runtime-kube-namespace', {
            describe: 'Name of the namespace on which runtime should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('build-annotations', {
            describe: 'The kubernetes metadata.annotations as "key=value" to be used by runner build resources (default is no node selector)',
        })
        .option('runtime-kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('attach-runtime', {
            describe: 'if set to true, auto attach runtime to agent (need to provide ....)',
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
            describe: 'should all pipelines run on the this runtime (default is false)',
        })
        .option('skip-cluster-creation', {
            description: 'If set to true, will skip cluster integration creation for this runtime',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'storage-class-name': storageClassName,
            'agent-name': agentName,
            'runtime-name': reName,
            'skip-re-creation': skipRuntimeCreation,
            'skip-cluster-creation': skipClusterCreation,
            'dry-run': dryRun,
            'in-cluster': inCluster,
            'kube-node-selector': kubeNodeSelector,
            'runtime-kube-config-path': kubeConfigPath,
            'set-value': setValue,
            'set-file': setFile,
            verbose,
            'build-annotations': buildAnnotations,
            'attach-runtime': attachRuntime,
            'cluster-service-account': clusterServiceAccount,
            'make-default-runtime': shouldMakeDefaultRe,
            'docker-registry': dockerRegistry,
            terminateProcess,
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
        if (attachRuntime && !agentKubeNamespace) {
            throw new Error('agent-kube-namespace is a mandatory parameter');
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
        const runtimeName = reName || await newRuntimeName(kubeContextName, kubeNamespace);

        if (!token) {
            // eslint-disable-next-line prefer-destructuring
            token = sdk.config.context.token;
        }

        // create RE in codefresh
        if (!skipRuntimeCreation) {
            await sdk.cluster.create({
                namespace: kubeNamespace,
                storageClassName: storageClassName || `${defaultStorageClassPrefix}-${kubeNamespace}`,
                serviceAccount: INSTALLATION_DEFAULTS.RUNTIME_SERVICE_ACCOUNT,
                nodeSelector: kubeNodeSelectorObj,
                annotations: buildAnnotations,
                clusterName,
                runtimeEnvironmentName: runtimeName,
                agent: true,
            });
            console.log(`Runtime environment "${colors.cyan(runtimeName)}" has been created`);
            if (shouldMakeDefaultRe) {
                const re = await sdk.runtimeEnvs.get({
                    name: runtimeName,
                });
                await sdk.runtimeEnvs.setDefault({ account: re.accountId, name: re.metadata.name });
                console.log(`Runtime environment "${colors.cyan(runtimeName)}" has been set as the default runtime`);
            }
        }

        // check if cluster already exists
        let createCluster = false;
        if (!skipClusterCreation) {
            try {
                const clusters = await sdk.clusters.list() || [];
                // should create cluster if it does not exist already
                createCluster = !clusters.find(cluster => cluster.selector === kubeContextName);
            } catch (error) {
                console.log(`Failed to fetch account clusters, cause: ${error.message}`);
            }
        }

        // create the cluster in codefresh if does not exists
        if (createCluster) {
            console.log(`Adding cluster "${colors.cyan(kubeContextName)}" integration to your Codefresh account`);
            try {
                await createClusterCmd.handler({
                    'kube-context': kubeContextName,
                    namespace: kubeNamespace,
                    'behind-firewall': true,
                    serviceaccount: clusterServiceAccount || 'default',
                    terminateProcess: false,
                });
            } catch (error) {
                console.log(`Failed to register cluster on Codefresh, cause: ${error.message}`);
            }
        }

        // install RE on cluster
        const runtimeEvents = new ProgressEvents();
        const runtimeFormat = 'downloading runtime installer [{bar}] {percentage}% | {value}/{total}';
        const runtimmrProgressBar = new cliProgress.SingleBar({ stopOnComplete: true, format: runtimeFormat }, cliProgress.Presets.shades_classic);
        let runtimeTotalSize;
        runtimeEvents.onStart((size) => {
            console.log('Downloading runtime installer:\n');
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
            kubeConfigPath,
            dockerRegistry,
            verbose,
            kubeNodeSelector,
            setValue,
            setFile,
            terminateProcess: !attachRuntime,
            events: runtimeEvents,
            storageClassName: storageClassName && storageClassName.startsWith('dind-local-volumes') ? undefined : storageClassName,
            logFormatting: DefaultLogFormatter,
        });
        // attach RE to agent in codefresh

        if (installRuntimeExitCode !== 0) {
            throw new Error(`Runtime environment installation failed with exit code: ${installRuntimeExitCode}`);
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
            } else {
                return runtimeName;
            }
        } else {
            console.log('Please run agent attach in order to link agent and runtime');
        }
    },
});


module.exports = installRuntimeCmd;
