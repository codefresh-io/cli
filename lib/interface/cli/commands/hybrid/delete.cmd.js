/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const { getAllKubeContexts, getKubeContext } = require('../../helpers/kubernetes');
const unInstallRuntime = require('../runtimeEnvironments/uninstall.cmd');
const unInstallAgent = require('../agent/uninstall.cmd');
const unInstallMonitor = require('../monitor/uninstall.cmd');
const colors = require('colors');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { prettyError } = require('../../../../logic/cli-config/errors/helpers');

const defaultNamespace = 'codefresh';

async function handleError(error, message) {
    if (!error) {
        return;
    }

    console.log(`${colors.red('Error:')} ${message}: ${prettyError(error)}`);
    console.log(colors.green(`If you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
    process.exit(1);
}

async function getAllNamespaces(runtimes) {
    return _(runtimes)
        .filter(re => !!_.get(re, 'runtimeScheduler.cluster.namespace'))
        .map(re => _.get(re, 'runtimeScheduler.cluster.namespace'))
        .uniq()
        .value();
}

async function getRelatedAgents(kubeNamespace, runtimes) {
    const [listAgentsErr, agents] = await to(sdk.agents.list({}));
    await handleError(listAgentsErr, 'Failed to get agents');

    const relatedREs = new Set();
    _.forEach(runtimes, (r) => {
        const ns = _.get(r, 'runtimeScheduler.cluster.namespace');
        if (ns === kubeNamespace) {
            relatedREs.add(r.metadata.name);
        }
    });

    const relatedAgents = [];
    _.forEach(agents, (a) => {
        _.forEach(_.get(a, 'runtimes', []), (r) => {
            if (relatedREs.has(r)) {
                relatedAgents.push(a);
            }
        });
    });

    return relatedAgents;
}

const deleteCmd = new Command({
    root: false,
    parent: runnerRoot,
    command: 'delete',
    requiresAuthentication: false,
    description: 'Deletes codefresh runner solution\'s components on kubernetes cluster',
    webDocs: {
        category: 'Runner',
        title: 'Delete',
        weight: 100,
    },
    // requiresAuthentication: argv => argv && !argv.token,
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be deleted',
        })
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL,
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context from which the Codefresh Agent and Runtime should be removed',
        })
        .option('kube-namespace', {
            describe: 'Name of the kubernetes namespace from which the Codefresh Agent and Runtime should be removed',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'kube-config-path': kubeConfigPath,
        } = argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            name: agentName,
        } = argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get runtime environments');

        console.log(colors.green('This uninstaller will guide you through the runner uninstallation process'));

        if (!kubeContextName) {
            const contexts = getAllKubeContexts(kubeConfigPath);
            const currentKubeContext = getKubeContext(kubeConfigPath);

            const answer = await inquirer.prompt({
                type: 'list',
                name: 'context',
                message: 'Name of Kubernetes context to use',
                default: currentKubeContext,
                choices: contexts,
            });

            kubeContextName = answer.context;
        }

        if (!kubeNamespace) {
            const namespaces = await getAllNamespaces(runtimes);
            if (!namespaces.length) {
                console.log('Could not find any namespaces with codefresh agents on the specified cluster');
                process.exit(1);
            }

            const answer = await inquirer.prompt({
                type: 'list',
                name: 'namespace',
                default: defaultNamespace,
                message: 'Kubernetes namespace to remove Codefresh Runner components from',
                choices: namespaces,
            });

            kubeNamespace = answer.namespace;
        }

        const agents = await getRelatedAgents(kubeNamespace, runtimes);
        if (!agents.length) {
            console.log('No agents related to the specified kubernetes cluster and namespace were found');
            process.exit(1);
        }

        if (!agentName) {
            const answer = await inquirer.prompt({
                type: 'list',
                name: 'name',
                message: 'Agent name to uninstall',
                choices: agents,
            });
            agentName = answer.name;
        }

        // check that agent exists
        const agent = _.find(agents, curr => curr.name === agentName);
        if (!agent) {
            console.log(colors.red(`Agent with name ${agentName} doesn't exists`));
            return;
        }
        if (agent.runtimes && agent.runtimes.length > 1) {
            console.log('Can\'t delete runner with more than one runtime, use runtime delete command');
            return;
        }

        console.log(`\n${colors.green('Uninstallation options summary:')} 
1. Kubernetes Context: ${colors.cyan(kubeContextName)}
2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
3. Agent name: ${colors.cyan(agentName)}
`);

        if (agent.runtimes.length === 1) {
            const uninstallRuntimeOptions = {
                'agent-name': agentName,
                'runtime-kube-namespace': kubeNamespace,
                'runtime-kube-context-name': kubeContextName,
                'agent-kube-context-name': kubeContextName,
                'agent-kube-namespace': kubeNamespace,
                name: agent.runtimes[0],
                terminateProcess: false,
            };
            const [uninstallReErr] = await to(unInstallRuntime.handler(uninstallRuntimeOptions));
            handleError(uninstallReErr, 'Failed to uninstall runtime-environment');
        }

        const uninstallAgentOptions = {
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            name: agentName,
            terminateProcess: false,
        };
        const [uninstallAgentErr] = await to(unInstallAgent.handler(uninstallAgentOptions));
        handleError(uninstallAgentErr, 'Failed to uninstall agent');

        const uninstallMonitorOptions = {
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            noExit: true, // to prevent if from calling: process.exit()
        };
        const [uninstallMonitorErr] = await to(unInstallMonitor.handler(uninstallMonitorOptions));
        handleError(uninstallMonitorErr, 'Failed to uninstall monitor');

        console.log('Successfully uninstalled Codefresh Runner');
        console.log(colors.green(`\nIf you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = deleteCmd;
