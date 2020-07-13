/* eslint-disable max-len */
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { sdk } = require('../../../../logic');
const installRuntimeCmd = require('../runtimeEnvironments/install.cmd');
const { getKubeContext } = require('../../helpers/kubernetes');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');
const colors = require('colors');
const { getNewAgentName } = require('./helper');
const { DefaultLogFormatter } = require('./../hybrid/helper');

const defaultNamespace = 'codefresh';

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
    builder: yargs => yargs
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
        .option('kubernetes-runner-type', {
            describe: 'Set the runner type to kubernetes (alpha feature)',
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
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        let {
            name, token,
        } = argv;
        const {
            'runtime-name': reName,
            'skip-re-creation': skipRuntimeCreation,
            'kube-node-selector': kubeNodeSelector,
            'build-node-selector': buildNodeSelector,
            'dry-run': dryRun,
            'in-cluster': inCluster,
            'kubernetes-runner-type': kubernetesRunnerType,
            tolerations,
            'kube-config-path': kubeConfigPath,
            'skip-version-check': skipVersionCheck,
            'install-runtime': installRuntime,
            'make-default-runtime': shouldMakeDefaultRe,
            'storage-class-name': storageClassName,
            verbose,
            terminateProcess,
            'set-value': setValue,
            'set-file': setFile,
            'agent-kube-context-name': agentKubeContextName,
            'agent-kube-namespace': agentKubeNamespace,
            'docker-registry': dockerRegistry,
            envVars,
        } = argv;
        let agent;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
        } = argv;
        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }
        if (!kubeNamespace) {
            kubeNamespace = defaultNamespace;
        }
        if (installRuntime && !agentKubeNamespace) {
            throw new Error('agent-kube-namespace is a mandatory parameter when installing runtime');
        }

        if (!token) { // Create an agent if not provided
            name = name || await getNewAgentName(kubeContextName, kubeNamespace);
            agent = await sdk.agents.create({ name });
            // eslint-disable-next-line prefer-destructuring
            token = agent.token;
            console.log(`A Codefresh Runner with the name: ${colors.cyan(name)} has been created.`);
        } else {
            // take the agent id from the token
            const apiKey = token.split('.')[0];
            const agentData = await sdk.tokens.getById({ id: apiKey });
            if (!agentData) {
                throw new Error('token is not valid');
            }
            const { subject } = agentData;

            if (subject.type !== 'agent') {
                throw new Error('token is not assosicated with a runner');
            }
            const agentId = agentData.subject.ref;
            const data = await sdk.agents.get({ agentId });
            // eslint-disable-next-line prefer-destructuring
            name = data.name;
        }
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
            apiHost,
            kubeContextName,
            kubeNamespace,
            token,
            dryRun,
            inCluster,
            kubeNodeSelector,
            dockerRegistry,
            kubernetesRunnerType,
            tolerations,
            kubeConfigPath,
            skipVersionCheck,
            verbose,
            agentId: name,
            terminateProcess,
            events,
            logFormatting: DefaultLogFormatter,
            envVars,
        });
        if (agentInstallStatusCode !== 0) {
            throw new Error(`\nRunner installation failed with code ${agentInstallStatusCode}`);
        }
        if (installRuntime) {
            return installRuntimeCmd.handler({
                'runtime-name': reName,
                'skip-re-creation': skipRuntimeCreation,
                'runtime-kube-context-name': kubeContextName,
                'runtime-kube-namespace': kubeNamespace,
                'agent-name': name,
                'runtime-kube-config-path': kubeConfigPath,
                'attach-runtime': true,
                'restart-agent': true,
                'make-default-runtime': shouldMakeDefaultRe,
                'kube-node-selector': buildNodeSelector,
                'storage-class-name': storageClassName,
                'set-value': setValue,
                'set-file': setFile,
                'agent-kube-namespace': agentKubeNamespace,
                'agent-kube-context-name': agentKubeContextName,
                verbose,
                terminateProcess,
            });
        }
    },
});

module.exports = installAgentCmd;
