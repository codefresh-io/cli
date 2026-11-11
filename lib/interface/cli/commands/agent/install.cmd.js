/* eslint-disable max-len */
const colors = require('colors');
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { sdk } = require('../../../../logic');
const installRuntimeCmd = require('../runtimeEnvironments/install.cmd');
const { getKubeContext } = require('../../helpers/kubernetes');
const { getNewAgentName } = require('./helper');
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

async function installRuntimeFunc(argv, agentName) {
    const {
        runtimeName,
        skipReCreation,
        buildNodeSelector,
        storageClassName,
        kubeConfigPath,
        kubeContextName,
        kubeNamespace,
        skipClusterCreation,
        makeDefaultRuntime,
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
        makeDefaultRuntime,
        attachRuntime: true,
        agentName,
    });
}

const installAgentCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'agent',
    description: 'Create an agent in the Codefresh platform',
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
            describe: 'Name of the kubernetes context where the runner is installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace where the runner is installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('install-runtime', {
            describe: 'Create runtime and attach it to the agent (default is false)',
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
        .option('skip-cluster-creation', {
            description: 'If set to true, will skip cluster integration creation for this runtime',
        })
        .option('make-default-runtime', {
            describe: 'should all pipelines run on the hybrid runtime (default is false)',
        })
        .option('storage-class-name', {
            describe: 'Set a name of your custom storage class, note: this will not install volume provisioning components',
        })
        .option('platform-only', {
            describe: 'Deprecated, has no effect: agent and runtime are always created on the platform side only',
        }),
    handler: async (argv) => {
        const { installRuntime } = argv;
        let {
            name,
            token,
        } = argv;

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

        if (installRuntime) {
            await installRuntimeFunc(argv, name);
        }

        console.log(token);
    },
});

module.exports = installAgentCmd;
