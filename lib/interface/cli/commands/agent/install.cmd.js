/* eslint-disable max-len */
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { sdk } = require('../../../../logic');

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
        .option('kubeContextName', {
            alias: 'kube-context-name',
            describe: 'Name of the kubernetes context on which venona should be installed (default is current-context) [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kubeNodeSelector', {
            alias: 'kube-node-selector',
            describe: 'The kubernetes node selector "key=value" to be used by venona build resources (default is no node selector) (string)',
        })
        .option('dryRun', {
            alias: 'dry-run',
            describe: 'Set to true to simulate installation',
        })
        .option('inCluster', {
            alias: 'in-cluster',
            describe: 'Set flag if venona is been installed from inside a cluster',
        })
        .option('kubeNamespace', {
            alias: 'kube-namespace',
            describe: 'Name of the namespace on which venona should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kubernetesRunnerType', {
            alias: 'kubernetes-runner-type',
            describe: 'Set the runner type to kubernetes (alpha feature)',
        })
        .option('tolerations', {
            alias: 'tolerations',
            describe: 'The kubernetes tolerations as path to a  JSON file to be used by venona resources (default is no tolerations) (string)',
        })
        .option('venonaVersion', {
            alias: 'venona-version',
            describe: 'Version of venona to install (default is the latest)',
        })
        .option('kubeConfigPath', {
            alias: 'kube-config-path',
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('skipVersionCheck', {
            alias: 'skip-version-check',
            describe: 'Do not compare current Venona\'s version with latest',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        let {
            name, token,
        } = argv;
        const {
            kubeContextName, kubeNamespace, dryRun,
            inCluster, kubeNodeSelector, kubernetesRunnerType,
            tolerations, venonaVersion, kubeConfigPath,
            skipVersionCheck, verbose,
        } = argv;
        let agent;
        if (!token) { // Create an agent if not provided
            name = name || `${kubeContextName}_${kubeNamespace}`;
            agent = await sdk.agents.create({ name });
            // eslint-disable-next-line prefer-destructuring
            token = agent.token;
            console.log(`An agent with name: ${name} and token ${token} was created`);
        } else {
            // take the agent id from the token
            const apiKey = token.split('.')[0];
            const agentData = await sdk.tokens.getById({ id: apiKey });
            if (!agentData) {
                throw new Error('token is not valid');
            }
            const { subject } = agentData;

            if (subject.type !== 'agent') {
                throw new Error('token is not assosicated with agent');
            }
            const agentId = agentData.subject.ref;
            const data = await sdk.agents.get({ agentId });
            // eslint-disable-next-line prefer-destructuring
            name = data.name;
        }
        const apiHost = sdk.config.context.url;
        await sdk.agents.install({
            apiHost,
            kubeContextName,
            kubeNamespace,
            token,
            dryRun,
            inCluster,
            kubeNodeSelector,
            kubernetesRunnerType,
            tolerations,
            venonaVersion,
            kubeConfigPath,
            skipVersionCheck,
            verbose,
            agentId: name,
        });
    },
});

module.exports = installAgentCmd;
