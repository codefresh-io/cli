/* eslint-disable max-len */
const colors = require('colors');
const _ = require('lodash');
const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const attachRuntimeCmd = require('./attach.cmd');
const installRoot = require('../root/install.cmd');
const { getKubeContext } = require('../../helpers/kubernetes');
const createClusterCmd = require('../cluster/create.cmd');
const { INSTALLATION_DEFAULTS } = require('../hybrid/helper');

const defaultNamespace = 'codefresh';
const defaultStorageClassPrefix = 'dind-local-volumes-runner';
const maxRuntimeNameLength = 63;

async function newRuntimeName(kubeContextName, kubeNamespace) {
    const defaultName = `${kubeContextName}/${kubeNamespace}`.slice(0, maxRuntimeNameLength);
    const runtimes = await sdk.runtimeEnvs.list({ });
    let name;

    if (!_.isArray(runtimes) || !_.find(runtimes, (re) => _.get(re, 'metadata.name') === defaultName)) {
        name = defaultName; // use the default name if there are no collisions
    } else {
        const reNames = new Set(_.map(runtimes, (re) => _.get(re, 'metadata.name'))); // for fast lookup
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

async function createRuntimeInPlatform(argv, runtimeName) {
    const {
        kubeNodeSelector,
        buildAnnotations,
        makeDefaultRuntime,
        runtimeKubeConfigPath,
        runtimeKubeContextName = getKubeContext(runtimeKubeConfigPath),
        runtimeKubeNamespace = defaultNamespace,
        storageClassName = `${defaultStorageClassPrefix}-${runtimeKubeNamespace}`,
    } = argv;

    // parse kubeNodeSelector in form key1=value1,key2=value2 to {key1: value1, key2: value2}
    const kubeNodeSelectorObj = {};
    if (kubeNodeSelector) {
        const nsSplitParts = kubeNodeSelector.split(',');
        nsSplitParts.forEach((nsPart) => {
            const [key, value] = nsPart.split('=');
            if (!key || !value) {
                throw new Error('invalid kube-node-selector parameter');
            }

            kubeNodeSelectorObj[key] = value;
        });
    }

    // create RE in codefresh
    await sdk.cluster.create({
        runtimeEnvironmentName: runtimeName,
        storageClassName: storageClassName || `${defaultStorageClassPrefix}-${runtimeKubeNamespace}`,
        serviceAccount: INSTALLATION_DEFAULTS.RUNTIME_SERVICE_ACCOUNT,
        nodeSelector: kubeNodeSelectorObj,
        annotations: buildAnnotations,
        clusterName: runtimeKubeContextName,
        namespace: runtimeKubeNamespace,
        agent: true,
    });
    console.log(`Runtime environment "${colors.cyan(runtimeName)}" has been created`);
    if (makeDefaultRuntime) {
        const re = await sdk.runtimeEnvs.get({
            name: runtimeName,
        });
        await sdk.runtimeEnvs.setDefault({ account: re.accountId, name: re.metadata.name });
        console.log(`Runtime environment "${colors.cyan(runtimeName)}" has been set as the default runtime`);
    }
}

async function createClusterInPlatform(argv) {
    const {
        clusterServiceAccount,
        runtimeKubeConfigPath,
        runtimeKubeContextName = getKubeContext(runtimeKubeConfigPath),
        runtimeKubeNamespace = defaultNamespace,
    } = argv;

    try {
        // check if cluster already exists
        const clusters = await sdk.clusters.list() || [];
        // should create cluster if it does not exist already
        const createCluster = !clusters.find((cluster) => cluster.selector === runtimeKubeContextName);

        // create the cluster in codefresh if does not exists
        if (createCluster) {
            console.log(`Adding cluster "${colors.cyan(runtimeKubeContextName)}" integration to your Codefresh account`);
            try {
                await createClusterCmd.handler({
                    'kube-context': runtimeKubeContextName,
                    namespace: runtimeKubeNamespace,
                    'behind-firewall': true,
                    serviceaccount: clusterServiceAccount || 'default',
                    terminateProcess: false,
                });
            } catch (error) {
                console.log(`Failed to register cluster on Codefresh, cause: ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`Failed to fetch account clusters, cause: ${error.message}`);
    }
}

async function attachRuntimeToAgent(agentName, runtimeName) {
    await attachRuntimeCmd.handler({
        agentName,
        runtimeName,
        terminateProcess: false,
    });
}

const installRuntimeCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'runtime',
    description: 'Create a runtime in the Codefresh platform',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Install Runtime-Environment',
        weight: 100,
    },
    builder: (yargs) => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('runtime-name', {
            describe: 'The name of the runtime to install',
        })
        .option('agent-name', {
            describe: 'Agent\'s name',
        })
        .option('storage-class-name', {
            describe: 'Set a name of your custom storage class, note: this will not install volume provisioning components',
        })
        .option('kube-node-selector', {
            describe: 'The kubernetes node selector "key=value" to be used by runner build resources (default is no node selector) (string)',
        })
        .option('runtime-kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('runtime-kube-context-name', {
            describe: 'Name of the kubernetes context on which the runtime should be installed (default is current-context) [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('runtime-kube-namespace', {
            describe: 'Name of the namespace on which runtime should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('build-annotations', {
            describe: 'The kubernetes metadata.annotations as "key=value" to be used by runner build resources (default is no node selector)',
        })
        .option('attach-runtime', {
            describe: 'if set to true, auto attach runtime to agent (need to provide --agent-name)',
        })
        .option('cluster-service-account', {
            describe: 'service account for cluster default is default',
        })
        .option('make-default-runtime', {
            describe: 'should all pipelines run on the this runtime (default is false)',
        })
        .option('skip-re-creation', {
            description: 'If set to true, will skip runtime creation in the platform',
        })
        .option('skip-cluster-creation', {
            description: 'If set to true, will skip cluster integration creation for this runtime',
        })
        .option('platform-only', {
            describe: 'Deprecated, has no effect: runtime is always created on the platform side only',
        }),
    handler: async (argv) => {
        const {
            runtimeName,
            agentName,
            skipReCreation,
            skipClusterCreation,
            attachRuntime,
            runtimeKubeConfigPath,
            runtimeKubeContextName = getKubeContext(runtimeKubeConfigPath),
            runtimeKubeNamespace = defaultNamespace,
        } = argv;

        const finalName = runtimeName || await newRuntimeName(runtimeKubeContextName, runtimeKubeNamespace);

        if (!skipReCreation) {
            await createRuntimeInPlatform(argv, finalName);
        }

        if (!skipClusterCreation) {
            await createClusterInPlatform(argv);
        }

        if (attachRuntime) {
            await attachRuntimeToAgent(agentName, finalName);
        } else {
            console.log('Please run agent attach in order to link agent and runtime');
        }
    },
});

module.exports = installRuntimeCmd;
