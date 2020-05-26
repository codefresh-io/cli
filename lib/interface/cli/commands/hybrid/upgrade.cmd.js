
/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const { getAllKubeContexts, getKubeContext, getAllNamespaces } = require('../../helpers/kubernetes');
const colors = require('colors');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const semver = require('semver');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    getRelatedAgents,
    getRuntimesWithVersions,
    getRuntimeVersion,
} = require('./helper');
const { migrate, upgrade } = require('./migration');

const openIssueMessage = `If you had any issues with the upgrade process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

function isOldVersion(version) {
    return semver.lt(version, '1.0.0');
}

function getStrategy(shouldDoMigration) {
    return shouldDoMigration ? migrate : upgrade;
}

const upgradeCmd = new Command({
    root: false,
    parent: runnerRoot,
    command: 'upgrade',
    requiresAuthentication: false,
    description: 'Upgrades codefresh runner solution\'s components',
    webDocs: {
        category: 'Runner',
        title: 'Upgrade',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_')
        .option('agent-name', {
            describe: 'The name of the agent to be upgraded or created',
        })
        .option('runtime-name', {
            describe: 'The name of the runtime to be upgraded',
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
            'agent-name': agentName,
        } = argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'runtime-name': runtimeName,
        } = argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get runtime environments');

        console.log(colors.green('This upgrader will guide you through the runner upgrade process'));

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
            const namespaces = await getAllNamespaces(kubeConfigPath, kubeContextName);
            const answer = await inquirer.prompt({
                type: 'list',
                name: 'namespace',
                message: 'Kubernetes namespace on which the runtime to be upgraded is installed',
                choices: namespaces,
            });

            kubeNamespace = answer.namespace;
        }

        let runtime;
        const agents = await getRelatedAgents(kubeNamespace, runtimes, handleError);

        if (!runtimeName) {
            const runtimesWithVersions = getRuntimesWithVersions(runtimes, agents);

            // for fast lookup of the choice
            const runtimesWithVersionsStrings = {};
            _.map(_.keys(runtimesWithVersions), (re) => { runtimesWithVersionsStrings[`${re} (version ${runtimesWithVersions[re]})`] = re; });

            const answer = await inquirer.prompt({
                type: 'list',
                name: 'runtime',
                message: 'Kubernetes namespace on which the runtime to be upgraded is installed',
                choices: _.keys(runtimesWithVersionsStrings),
            });

            runtimeName = runtimesWithVersionsStrings[answer.runtime];
            runtime = { name: runtimeName, version: runtimesWithVersions[runtimeName] };
        } else {
            const version = getRuntimeVersion(runtimeName, agents);
            runtime = { name: runtimeName, version };
        }

        let shouldDoMigration;
        if (isOldVersion(runtime.version)) {
            const answer = await inquirer.prompt({
                type: 'confirm',
                name: 'shouldMigrate',
                message: 'Old version of codefresh hybrid runtime detected (<1.x.x), do you want to migrate you runtime to version 1.x.x ?',
                default: true,
            });

            shouldDoMigration = answer.shouldMigrate;
        } else {
            shouldDoMigration = false; // just upgrade
        }

        const strategy = getStrategy(shouldDoMigration);
        const [err] = await to(strategy(kubeContextName, kubeNamespace, agentName));
        handleError(err, 'Failed to upgrade codefresh runner');

        console.log('Successfully upgraded Codefresh Runner');
        console.log(colors.green(`\nIf you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = upgradeCmd;
