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
const YAML = require('yaml');
const fs = require('fs');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    getRelatedAgents,
    getRelatedNamespaces,
    drawCodefreshFiglet,
    unInstallAppProxy,
} = require('./helper');

const defaultNamespace = 'codefresh';
const openIssueMessage = `If you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

async function promptConfirmationMessage({
    agentName,
    kubeNamespace,
    attachedRuntimes,
}) {
    // prompt confirmation message
    console.log(`${colors.red('This process will attempt to delete the following:')}`);
    console.log(`\u2022 Codefresh runner with the name "${colors.cyan(agentName)}"`);
    attachedRuntimes.forEach((reName) => { console.log(`\u2022 Codefresh runtime with the name "${colors.cyan(reName)}"`); });
    console.log('\u2022 Codefresh runner monitor component');
    console.log(`* The kubernetes namespace "${colors.cyan(kubeNamespace)}" will ${colors.underline('not')} be deleted\n`);

    const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'deletionConfirmed',
        default: false,
        message: 'Are you sure you want to delete all of the above? (default is NO)',
    });
    if (!answer.deletionConfirmed) {
        console.log('Deletion process aborted, exiting...');
        process.exit(1);
    }
}

const deleteCmd = new Command({
    root: false,
    parent: runnerRoot,
    command: 'delete',
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
        })
        .option('force', {
            describe: 'Run the delete operation without asking to confirm (use with caution!)',
            alias: 'f',
            type: Boolean,
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
        .option('values', {
            describe: 'specify values in a YAML file',
        })
        .option('verbose', {
            describe: 'Print logs',
        })
        .option('insecure', {
            describe: 'disable certificate validation for TLS connections (e.g. to g.codefresh.io)',
            type: 'boolean',
        }),
    handler: async (argv) => {
        let {
            'kube-config-path': kubeConfigPath,
            url, force,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            name: agentName,
            values: valuesFile,
            insecure,
        } = argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get runtime environments');
        const [listAgentsErr, agents] = await to(sdk.agents.list({ }));
        await handleError(listAgentsErr, 'Failed to get agents');

        if (!agents.length) {
            console.log('No runners found on your codefresh account');
            process.exit(0);
        }

        console.log(colors.green('This uninstaller will guide you through the runner uninstallation process'));
        if (valuesFile) {
            const valuesFileStr = fs.readFileSync(valuesFile, 'utf8');
            valuesObj = YAML.parse(valuesFileStr);

            if (!kubeConfigPath && valuesObj.ConfigPath) {
                kubeConfigPath = valuesObj.ConfigPath;
            }
            if (!kubeNamespace && valuesObj.Namespace) {
                kubeNamespace = valuesObj.Namespace;
            }
            if (!kubeContextName && valuesObj.Context) {
                kubeContextName = valuesObj.Context;
            }
            if (!url && valuesObj.CodefreshHost) {
                url = valuesObj.CodefreshHost;
            }

            if (!agentName && valuesObj.AgentId) {
                agentName = valuesObj.AgentId;
            }
            if (_.isUndefined(insecure)) {
                insecure = _.get(valuesObj, 'Insecure');
            }
        }
        if (!url) {
            url = DEFAULTS.URL;
        }
        if (insecure) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

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
            const [getNamespacesErr, relatedNamespaces] = await to(getRelatedNamespaces(kubeConfigPath, kubeContextName, runtimes));
            handleError(getNamespacesErr, 'Could not get namespaces in the selected kubernetes cluster');
            let answer;
            if (!relatedNamespaces.length) {
                answer = await inquirer.prompt({
                    type: 'input',
                    name: 'namespace',
                    default: defaultNamespace,
                    message: 'Kubernetes namespace to remove Codefresh Runner components from',
                    validate: value => (value !== undefined && value !== '') || 'Please enter namespace\'s name',
                });
            } else {
                answer = await inquirer.prompt({
                    type: 'list',
                    name: 'namespace',
                    default: defaultNamespace,
                    message: 'Kubernetes namespace to remove Codefresh Runner components from ',
                    choices: relatedNamespaces,
                });
            }

            kubeNamespace = answer.namespace;
        }

        if (!agentName) {
            const relatedAgents = await getRelatedAgents(kubeNamespace, runtimes, agents, handleError);
            let agentsChoices = relatedAgents;
            if (!relatedAgents.length) {
                console.log(colors.yellow('No agents related to the specified kubernetes cluster and namespace were found, displaying all agents'));
                agentsChoices = agents;
            }
            const choicesToAgentNames = agentsChoices.reduce((acc, a) => {
                acc[`${a.name}\t${a.runtimes.length ? `(attached runtimes: ${a.runtimes.join(', ')})` : ''}`] = a.name;
                return acc;
            }, {});
            const answer = await inquirer.prompt({
                type: 'list',
                name: 'name',
                message: 'Agent name to uninstall',
                choices: Object.keys(choicesToAgentNames),
            });
            agentName = choicesToAgentNames[answer.name];
        }

        // check that agent exists
        const agent = _.find(agents, curr => curr.name === agentName);
        if (!agent) {
            console.log(colors.red(`Agent with name "${agentName}" doesn't exists`));
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

        const attachedRuntimes = agent.runtimes || [];

        if (!force) {
            await promptConfirmationMessage({ agentName, kubeNamespace, attachedRuntimes });
        }

        await Promise.all(attachedRuntimes.map(async (reName) => {
            const uninstallRuntimeOptions = {
                'agent-name': agentName,
                'runtime-kube-namespace': kubeNamespace,
                'runtime-kube-context-name': kubeContextName,
                'agent-kube-context-name': kubeContextName,
                'agent-kube-namespace': kubeNamespace,
                name: reName,
                terminateProcess: false,
            };
            const re = runtimes.find(runtime => runtime.metadata.name === reName);
            if (re.appProxy) {
                await unInstallAppProxy({
                    kubeConfigPath,
                    kubeContextName,
                    kubeNamespace,
                });
            }
            const [uninstallReErr] = await to(unInstallRuntime.handler(uninstallRuntimeOptions));
            handleError(uninstallReErr, `Failed to uninstall runtime-environment "${colors.cyan(reName)}"`);
        }));

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
        console.log(`\nIf you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`);
        await drawCodefreshFiglet();
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = deleteCmd;
