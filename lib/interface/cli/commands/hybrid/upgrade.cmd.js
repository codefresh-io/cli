
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
    getRuntimesWithVersions,
    getRuntimeVersion,
    drawCodefreshFiglet,
} = require('./helper');
const { migrate, upgrade } = require('./migration');

const openIssueMessage = `If you had any issues with the upgrade process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

function isOldVersion(version) {
    const v = version.split('x').join('0');
    return semver.lt(v, '1.0.0');
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
        .option('install-monitor', {
            describe: 'Install a monitoring component that will help provide valueable data about your cluster to Codefresh (only useable when running migration)',
            type: 'boolean',
            default: true,
        })
        .option('verbose', {
            describe: 'Print logs',
        })
        .option('insecure', {
            describe: 'disable certificate validation for TLS connections (e.g. to g.codefresh.io)',
            type: 'boolean',
        }),
    handler: async (argv) => {
        const {
            'kube-config-path': kubeConfigPath,
            'agent-name': agentName,
            'install-monitor': installMonitor,
            verbose,
            insecure,
        } = argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'runtime-name': runtimeName,
        } = argv;

        if (insecure) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get runtime environments');
        const runtimesByName = runtimes.reduce((acc, cur) => ({ ...acc, [cur.metadata.name]: cur }), {});

        const [listAgentsErr, agents] = await to(sdk.agents.list({ }));
        await handleError(listAgentsErr, 'Failed to get agents');
        const agentsByName = agents.reduce((acc, cur) => ({ ...acc, [cur.name]: cur }), {});

        console.log(colors.green('This upgrader will guide you through the runner upgrade process'));

        let runtimeVersion;

        if (agentName && agentsByName[agentName]) {
            const agent = agentsByName[agentName];
            const attachedRuntimes = agent.runtimes || [];
            if (attachedRuntimes.length === 1) {
                [runtimeName] = attachedRuntimes;
                console.log(`Chose to upgrade runner: "${colors.cyan(agentName)}" and runtime: "${colors.cyan(runtimeName)}"`);
            }
        }

        if (!runtimeName) {
            const runtimesWithVersions = getRuntimesWithVersions(runtimes, agents);
            if (!_.size(runtimesWithVersions)) {
                handleError(new Error('Found 0 runtime environments that can be upgraded or migrated'), 'no runtimes found');
            }

            // for fast lookup of the choice
            const runtimesWithVersionsStrings = {};
            _.map(_.keys(runtimesWithVersions), (re) => { runtimesWithVersionsStrings[`${re}\t(version ${runtimesWithVersions[re]})\t${runtimesWithVersions[re] === '0.x.x' ? '[migrate]' : '[upgrade]'}`] = re; });

            const answer = await inquirer.prompt({
                type: 'list',
                name: 'runtime',
                message: 'The runtimes that can be upgraded or migrated (if version < 1.x.x)',
                choices: _.keys(runtimesWithVersionsStrings),
            });

            runtimeName = runtimesWithVersionsStrings[answer.runtime];
            runtimeVersion = runtimesWithVersions[runtimeName];
        } else {
            runtimeVersion = getRuntimeVersion(runtimeName, agents);
        }
        const runtime = runtimesByName[runtimeName];
        if (!runtime) {
            handleError(new Error(`runtime environment "${colors.cyan(runtimeName)}" does not exist on this account. run "${colors.cyan('codefresh get re')}" to get all runtimes-environments of this account`), 'runtime environment not found');
        }
        runtime.metadata.version = runtimeVersion;

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
            kubeNamespace = _.get(runtime, 'runtimeScheduler.cluster.namespace');
        }

        if (!kubeNamespace) {
            const [err, namespaces] = await to(getAllNamespaces(kubeConfigPath, kubeContextName));
            handleError(err, 'Failed to get cluster namespaces');

            const answer = await inquirer.prompt({
                type: 'list',
                name: 'namespace',
                message: 'Kubernetes namespace on which the runtime to be upgraded/migrated is installed',
                choices: namespaces,
            });

            kubeNamespace = answer.namespace;
        }

        console.log(`\n${colors.green('Upgrade options summary:')} 
1. Kubernetes Context: ${colors.cyan(kubeContextName)}
2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
3. Runtime name: ${colors.cyan(runtimeName)}
`);

        const shouldDoMigration = isOldVersion(runtime.metadata.version);
        const strategy = getStrategy(shouldDoMigration);
        const [err] = await to(strategy({
            kubeContextName,
            kubeNamespace,
            agentName,
            agents,
            runtimeName,
            installMonitor,
            verbose,
            handleError,
        }));
        handleError(err, `Failed to ${shouldDoMigration ? 'migrate' : 'upgrade'} codefresh runner`);

        console.log(colors.green(`\nSuccessfully ${shouldDoMigration ? 'migrated' : 'upgraded'} your Codefresh Runner to the latest version`));
        console.log(colors.green(`If you had any issues with the migration process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
        await drawCodefreshFiglet();
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = upgradeCmd;
