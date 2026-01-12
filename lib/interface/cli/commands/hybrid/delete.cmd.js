/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer').default;
const { getAllKubeContexts, getKubeContext } = require('../../helpers/kubernetes');
const unInstallRuntime = require('../runtimeEnvironments/uninstall.cmd');
const unInstallAgent = require('../agent/uninstall.cmd');
const unInstallMonitor = require('../monitor/uninstall.cmd');
const colors = require('colors');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    getRelatedAgents,
    getRelatedNamespaces,
    drawCodefreshFiglet,
    unInstallAppProxy,
    mergeValuesFromValuesFile,
    INSTALLATION_DEFAULTS,
} = require('./helper');

const defaultNamespace = 'codefresh';
const openIssueMessage = `If you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

async function promptConfirmationMessage({
    agentName,
    kubeNamespace,
    attachedRuntimes,
    defaultRuntime,
    clustersToDelete,
    appProxyToDelete,
}) {
    const note = colors.underline(colors.yellow('Note'));
    let newDefaultRuntime = defaultRuntime;

    // prompt confirmation message
    console.log(`${colors.red('This process will attempt to delete the following:')}`);
    console.log(`\u2022 Codefresh runner with the name "${colors.cyan(agentName)}"`);
    attachedRuntimes.forEach((reName) => { console.log(`\u2022 Codefresh runtime with the name "${colors.cyan(reName)}"${defaultRuntime === reName ? ' [default runtime]' : ''}`); });
    console.log('\u2022 Codefresh runner monitor component');
    clustersToDelete.forEach((cluster) => { console.log(`\u2022 Codefresh cluster integration: "${colors.cyan(cluster.selector)}"`); });
    appProxyToDelete.forEach((appProxy) => { console.log(`\u2022 App-Proxy component: "${colors.cyan(appProxy)}"`); });

    // if this includes your default runtime
    if (attachedRuntimes.length > 0) {
        if (defaultRuntime && attachedRuntimes.includes(defaultRuntime)) {
            newDefaultRuntime = INSTALLATION_DEFAULTS.SAAS_RUNTIME;
            console.log(`* ${note}: "${colors.cyan(defaultRuntime)}" is set as your default runtime-environment,`
            + ` if you delete this runtime your new default runtime will be: "${colors.cyan(newDefaultRuntime)}"`);
        }

        console.log(`* ${note}: any pipeline set to run on one of the above runtime environments will be moved to`
        + ` run on your ${newDefaultRuntime !== defaultRuntime ? 'new ' : ''}default runtime environment: "${colors.cyan(newDefaultRuntime)}"`);
    }

    console.log(`* ${note}: The kubernetes namespace "${colors.cyan(kubeNamespace)}" will ${colors.underline('not')} be deleted\n`);

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

// returns the clusters that are referenced by the runtimesToDelete and not referenced by runtimesToKeep
function getClustersToDelete(clusters, runtimes, runtimesToDelete) {
    const potentialClustersNames = _(runtimesToDelete).map(re => _.get(re, 'runtimeScheduler.cluster.clusterProvider.selector')).compact().value();
    const runtimesToDeleteNames = _(runtimesToDelete).map(re => _.get(re, 'metadata.name')).compact().value();

    const potentialClustersToDelete = _.filter(clusters, c => potentialClustersNames.includes(c.selector));
    const runtimesToKeep = _.filter(runtimes, re => !runtimesToDeleteNames.includes(_.get(re, 'metadata.name')));

    return _.filter(potentialClustersToDelete, c => !_.find(runtimesToKeep, re => _.get(re, 'runtimeScheduler.cluster.clusterProvider.selector') === c.selector));
}

function getAppProxyToDelete(runtimesToDelete) {
    return _.reduce(runtimesToDelete, (acc, re) => {
        const appProxy = _.get(re, 'appProxy.externalIP');
        if (appProxy) {
            acc.push(appProxy);
        }
        return acc;
    }, []);
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
        .option('keep-cluster-integration', {
            describe: 'If true, will not delete dangling cluster integrations from Codefresh',
            type: Boolean,
        })
        .option('values', {
            describe: 'specify values in a YAML file',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        let _argv = argv;

        // read values from values file
        if (argv.values) {
            _argv = mergeValuesFromValuesFile(_argv, _argv.values, handleError);
        }

        const {
            verbose,
            force,
            'kube-config-path': kubeConfigPath,
            'keep-cluster-integration': keepClusterIntegration,
        } = _argv;
        let {
            url,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            name: agentName,
        } = _argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get runtime environments');
        const [listAgentsErr, agents] = await to(sdk.agents.list({ }));
        await handleError(listAgentsErr, 'Failed to get agents');
        const [listClustersErr, clusters] = await to(sdk.clusters.list());
        await handleError(listClustersErr, 'Failed to get cluster integrations');

        if (!agents || !agents.length) {
            console.log('No runners found on your codefresh account');
            process.exit(0);
        }

        console.log(colors.green('This uninstaller will guide you through the runner uninstallation process'));

        if (!url) {
            url = DEFAULTS.URL;
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
        const runtimesToDelete = _.filter(runtimes, re => attachedRuntimes.includes(_.get(re, 'metadata.name')));
        const defaultRuntime = _.get(_.find(runtimes, re => re.default), 'metadata.name');

        const clustersToDelete = keepClusterIntegration ? [] : getClustersToDelete(clusters, runtimes, runtimesToDelete);
        const appProxyToDelete = getAppProxyToDelete(runtimesToDelete);

        if (!force) {
            await promptConfirmationMessage({
                agentName,
                kubeNamespace,
                attachedRuntimes,
                defaultRuntime,
                clustersToDelete,
                appProxyToDelete,
            });
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
                verbose,
            };
            const re = runtimes.find(runtime => runtime.metadata.name === reName);
            if (!re) {
                // re already deleted
                return;
            }

            // remove runtime cluster components
            console.log(`Deleting runtime-environment: ${colors.cyan(reName)} from cluster`);
            const [uninstallReErr] = await to(unInstallRuntime.handler(uninstallRuntimeOptions));
            handleError(uninstallReErr, `Failed to uninstall runtime-environment "${colors.cyan(reName)}"`);

            // delete codefresh entity
            console.log(`Deleting runtime-environment: "${colors.cyan(reName)}" from codefresh`);
            await to(sdk.runtimeEnvs.delete({ name: reName, force: true })); // also delete default runtime

            if (re.appProxy) {
                const [uninstallAppProxyErr] = await to(unInstallAppProxy({
                    kubeConfigPath,
                    kubeContextName,
                    kubeNamespace,
                    verbose,
                }));
                handleError(uninstallAppProxyErr, 'Failed to uninstall app-proxy');
                console.log('App-Proxy uninstalled successfully');
            }
        }));

        await Promise.all(clustersToDelete.map(async (cluster) => {
            console.log(`Deleting cluster integration: "${colors.cyan(cluster.selector)}"`);
            const [clusterDeleteErr] = await to(sdk.clusters.delete({ id: cluster._id, provider: cluster.provider }));
            handleError(clusterDeleteErr, 'Failed to delete cluster integration');
        }));

        const uninstallAgentOptions = {
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            name: agentName,
            terminateProcess: false,
            verbose,
        };
        const [uninstallAgentErr] = await to(unInstallAgent.handler(uninstallAgentOptions));
        handleError(uninstallAgentErr, 'Failed to uninstall agent');

        const uninstallMonitorOptions = {
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            verbose,
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
