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

const defaultNamespace = 'codefresh';

function prettyError(error) {
    try {
        const errMsg = _.get(error, 'message', error);
        let errObj = JSON.parse(errMsg);
        if (typeof errObj === 'string') {
            errObj = JSON.parse(errObj);
        }

        if (!errObj.message) {
            return error;
        }

        return errObj.code ? `${errObj.message} [code: ${errObj.code}]` : errObj.message;
    } catch (e) {
        return _.get(error, 'message', JSON.stringify(error));
    }
}

async function handleError(error, message) {
    if (!error) {
        return;
    }

    console.log(`${colors.red('Error:')} ${message}: ${prettyError(error)}`);
    console.log(colors.green(`If you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
    process.exit(1);
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

        const questions = [];
        if (!kubeContextName) {
            const contexts = getAllKubeContexts(kubeConfigPath);
            const currentKubeContext = getKubeContext(kubeConfigPath);

            questions.push({
                type: 'list',
                name: 'context',
                message: 'Name of Kubernetes context to use',
                default: currentKubeContext,
                choices: contexts,
            });
        }
        if (!kubeNamespace) {
            questions.push({
                type: 'input',
                name: 'namespace',
                default: defaultNamespace,
                message: 'Kubernetes namespace to remove Codefresh Runner components from ',
                validate: value => (value !== undefined && value !== '') || 'Please enter namespace\'s name',
            });
        }
        const [listAgentsErr, agents] = await to(sdk.agents.list({}));
        await handleError(listAgentsErr, 'Failed to get agents');
        if (!agentName) {
            questions.push({
                type: 'list',
                name: 'name',
                message: 'Agent name to uninstall',
                choices: agents,
            });
        }
        console.log(colors.green('This uninstaller will guide you through the runner uninstallation process'));
        const answers = await inquirer.prompt(questions);
        kubeContextName = kubeContextName || answers.context;
        kubeNamespace = kubeNamespace || answers.namespace;
        agentName = agentName || answers.name;
        // check that agent exists
        const agent = _.find(agents, curr => curr.name === agentName);
        if (!agent) {
            console.log(colors.red(`Agent with name ${agentName} doesn't exists`));
            return;
        }
        if (agent.runtimes && agent.runtimes > 1) {
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
