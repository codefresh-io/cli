/* eslint-disable max-len */
const cliProgress = require('cli-progress');
const colors = require('colors');
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { sdk } = require('../../../../logic');
const installRuntimeCmd = require('../runtimeEnvironments/install.cmd');
const { getKubeContext } = require('../../helpers/kubernetes');
const ProgressEvents = require('../../helpers/progressEvents');
const { getNewAgentName } = require('./helper');
const { DefaultLogFormatter } = require('../hybrid/helper');
const Output = require('../../../../output/Output');

const defaultNamespace = 'codefresh';

async function createAgent(argv) {
    const {
        name,
        kubeConfigPath,
        kubeContextName = getKubeContext(kubeConfigPath),
        kubeNamespace = defaultNamespace,
    } = argv;
    const finalName = name || await getNewAgentName(kubeContextName, kubeNamespace);
    try {
        const { token } = await sdk.agents.create({ name: finalName });
        console.log(`A Codefresh Runner with the name: ${colors.cyan(finalName)} has been created.`);
        return token;
    } catch (err) {
        const msg = Output._extractErrorMessage(err);
        if (msg.includes('Agent name duplication')) {
            throw new Error(`A Codefresh Runner with the name "${colors.cyan(finalName)}" already exists. Please choose a different name, or delete the current agent from the platform.`);
        }

        throw err;
    }
}

async function getAgentNameByToken(token) {
    const [apiKey] = token.split('.');
    const agentData = await sdk.tokens.getById({ id: apiKey });
    if (!agentData) {
        throw new Error('token is not valid');
    }

    const {
        subject: {
            type,
            ref,
        },
    } = agentData;

    if (type !== 'agent') {
        throw new Error('token is not assosicated with a runner');
    }

    const { name } = await sdk.agents.get({ agentId: ref });
    return name;
}

async function installAgentInCluster(argv, token, agentName) {
    const {
        kubeNodeSelector,
        dryRun,
        inCluster,
        tolerations,
        dockerRegistry,
        skipVersionCheck,
        kubeConfigPath,
        kubeContextName = getKubeContext(kubeConfigPath),
        kubeNamespace = defaultNamespace,
        envVars,
        verbose,
        terminateProcess,
    } = argv;

    const apiHost = sdk.config.context.url;
    const events = new ProgressEvents();
    const format = 'downloading [{bar}] {percentage}% | {value}/{total}';
    const progressBar = new cliProgress.SingleBar({ stopOnComplete: true, format }, cliProgress.Presets.shades_classic);
    let totalSize;
    events.onStart((size) => {
        console.log('Downloading Codefresh Runner installer \n');
        progressBar.start(size, 0);
        totalSize = size;
    });
    events.onProgress((progress) => {
        progressBar.update(progress);
        if (progress >= totalSize) {
            console.log('\n');
        }
    });
    const agentInstallStatusCode = await sdk.agents.install({
        agentId: agentName,
        apiHost,
        token,
        kubeConfigPath,
        kubeContextName,
        kubeNamespace,
        kubeNodeSelector,
        inCluster,
        dockerRegistry,
        tolerations,
        skipVersionCheck,
        envVars,
        events,
        dryRun,
        verbose,
        terminateProcess,
        logFormatting: DefaultLogFormatter,
    });
    if (agentInstallStatusCode !== 0) {
        throw new Error(`\nRunner installation failed with code ${agentInstallStatusCode}`);
    }
}

async function installRuntimeFunc(argv, agentName) {
    const {
        runtimeName,
        skipReCreation,
        buildNodeSelector,
        storageClassName,
        setValue,
        setFile,
        agentKubeContextName,
        agentKubeNamespace,
        kubeConfigPath,
        kubeContextName,
        kubeNamespace,
        skipClusterCreation,
        makeDefaultRuntime,
        platformOnly,
        verbose,
        terminateProcess,
    } = argv;
    await installRuntimeCmd.handler({
        runtimeName,
        skipReCreation,
        skipClusterCreation,
        runtimeKubeConfigPath: kubeConfigPath,
        runtimeKubeContextName: kubeContextName,
        runtimeKubeNamespace: kubeNamespace,
        kubeNodeSelector: buildNodeSelector,
        storageClassName,
        setValue,
        setFile,
        makeDefaultRuntime,
        attachRuntime: true,
        agentName,
        agentKubeContextName,
        agentKubeNamespace,
        restartAgent: true,
        platformOnly,
        verbose,
        terminateProcess,
    });
}

const installAgentCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'agent',
    description: 'Install and create an agent on kubernetes cluster',
    webDocs: {
        category: 'Agents',
        title: 'Install',
        weight: 100,
    },
    builder: (yargs) => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be created if token is not provided',
        })
        .option('token', {
            describe: 'Agent\'s token',
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which runner should be installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-node-selector', {
            describe: 'The kubernetes node selector "key=value" to be used by runner build resources (default is no node selector) (string)',
        })
        .option('dry-run', {
            describe: 'Set to true to simulate installation',
        })
        .option('in-cluster', {
            describe: 'Set flag if runner is been installed from inside a cluster',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which runner should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('tolerations', {
            describe: 'The kubernetes tolerations as path to a  JSON file to be used by runner resources (default is no tolerations) (string)',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('skip-version-check', {
            describe: 'Do not compare current runner\'s version with latest',
        })
        .option('install-runtime', {
            describe: 'Install and attach runtime on the same namespace as the agent (default is false)',
        })
        .option('runtime-name', {
            describe: 'The name of the runtime to install',
        })
        .option('build-node-selector', {
            describe: 'The kubernetes node selector "key=value" to be used by runner build resources (default is no node selector) (string)',
        })
        .option('skip-re-creation', {
            description: 'If set to true, will skip runtime creation in the platform',
        })
        .option('set-value', {
            describe: 'Set values for templates, example: --set-value LocalVolumesDir=/mnt/disks/ssd0/codefresh-volumes',
        })
        .option('set-file', {
            describe: 'Set values for templates from file, example: --set-file Storage.GoogleServiceAccount=/path/to/service-account.json',
        })
        .option('skip-cluster-creation', {
            description: 'If set to true, will skip cluster integration creation for this runtime',
        })
        .option('make-default-runtime', {
            describe: 'should all pipelines run on the hybrid runtime (default is false)',
        })
        .option('storage-class-name', {
            describe: 'Set a name of your custom storage class, note: this will not install volume provisioning components',
        })
        .option('agent-kube-context-name', {
            describe: 'Agent kubernetes context (on attach)',
        })
        .option('agent-kube-namespace', {
            describe: 'Agent\'s namespace (on attach)',
        })
        .option('docker-registry', {
            describe: 'The prefix for the container registry that will be used for pulling the required components images. Example: --docker-registry="docker.io"',
            type: 'string',
        })
        .option('platform-only', {
            describe: 'Set to true to create runtime on the platform side only',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            agentKubeNamespace,
            installRuntime,
            platformOnly,
        } = argv;
        let {
            name,
            token,
        } = argv;

        if (installRuntimeFunc && !agentKubeNamespace) {
            throw new Error('agent-kube-namespace is a mandatory parameter when installing runtime');
        }

        if (!token) {
            // Create an agent if not provided
            token = await createAgent(argv);
        } else {
            // take the agent name from the token
            const nameFromToken = await getAgentNameByToken(token);
            if (!name) {
                name = nameFromToken;
            } else if (name !== nameFromToken) {
                throw new Error(`token is assosicated with agent ${nameFromToken}, different from supplied '--name ${name}'`);
            }
        }

        if (!platformOnly) {
            await installAgentInCluster(argv, token, name);
        }

        if (installRuntime) {
            await installRuntimeFunc(argv, name);
        }

        console.log(token);
    },
});

module.exports = installAgentCmd;
