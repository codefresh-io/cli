/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const { getAllKubeContexts, getKubeContext } = require('../../helpers/kubernetes');
const installAgent = require('../agent/install.cmd');
const createContext = require('../auth/create-context.cmd');
const getAgents = require('../agent/get.cmd');
const { getConfigForSdk } = require('../../commad-line-interface');
const colors = require('colors');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');

const INSTALLATION_DEFAULTS = {
    NAMESPACE: 'codefresh',
    MAKE_DEFAULT_RE: true,
    RUN_DEMO_PIPELINE: true,
};

const initCmd = new Command({
    root: false,
    parent: runnerRoot,
    command: 'init',
    requiresAuthentication: false,
    description: 'Install Codefresh Runner solution\'s components on kubernetes cluster',
    webDocs: {
        category: 'Runner',
        title: 'Init',
        weight: 100,
    },
    // requiresAuthentication: argv => argv && !argv.token,
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be created if token is not provided',
        })
        .option('token', {
            describe: 'Registration\'s token',
        })
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL,
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which venona should be installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-node-selector', {
            describe: 'The kubernetes node selector "key=value" to be used by venona build resources (default is no node selector) (string)',
        })
        .option('dry-run', {
            describe: 'Set to true to simulate installation',
        })
        .option('yes', {
            describe: 'Use installation defaults (don\'t ask any questions)',
            alias: 'y',
            type: 'boolean',
        })
        .option('set-default-runtime', {
            describe: 'Set this as the default runtime environment for your Codefresh account',
            type: 'boolean',
        })
        .option('exec-demo-pipeline', {
            describe: 'Run a demo pipeline after the installation completes',
            type: 'boolean',
        })
        .option('in-cluster', {
            describe: 'Set flag if venona is been installed from inside a cluster',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which venona should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kubernetes-runner-type', {
            describe: 'Set the runner type to kubernetes (alpha feature)',
        })
        .option('tolerations', {
            describe: 'The kubernetes tolerations as path to a  JSON file to be used by venona resources (default is no tolerations) (string)',
        })
        .option('venona-version', {
            describe: 'Version of venona to install (default is the latest)',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('skip-version-check', {
            describe: 'Do not compare current Venona\'s version with latest',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'kube-node-selector': kubeNodeSelector,
            'dry-run': dryRun,
            'in-cluster': inCluster,
            'kubernetes-runner-type': kubernetesRunnerType,
            tolerations,
            'venona-version': venonaVersion,
            'kube-config-path': kubeConfigPath,
            'skip-version-check': skipVersionCheck,
            yes: noQuestions,
            verbose,
            name, token, url,
        } = argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'set-default-runtime': shouldMakeDefaultRe,
            'exec-demo-pipeline': shouldExecutePipeline,
        } = argv;

        if (_.get(sdk, 'config.context.isNoAuth') && !token) {
            console.log('Not authenticated as a Codefresh account: ');
            console.log('In order to install a Codefresh Runner you need to provide ' +
                `an authentication token which can be generated here: ${colors.blue(`${argv.url}/user/settings`)}` +
                '\nAfter getting the token you may run this command again with the [--token] option or use the \'codefresh auth\' command to create an authenticated context.');
            process.exit(1);
        }

        if (noQuestions) {
            // set defaults
            kubeContextName = getKubeContext(kubeConfigPath);
            kubeNamespace = INSTALLATION_DEFAULTS.NAMESPACE;
            shouldMakeDefaultRe = INSTALLATION_DEFAULTS.MAKE_DEFAULT_RE;
            shouldExecutePipeline = INSTALLATION_DEFAULTS.RUN_DEMO_PIPELINE;
        }

        const questions = [];
        if (!kubeContextName && !noQuestions) {
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
        if (!kubeNamespace && !noQuestions) {
            questions.push({
                type: 'input',
                name: 'namespace',
                default: INSTALLATION_DEFAULTS.NAMESPACE,
                message: 'Kubernetes namespace to install into (will be created if it does not exist)',
                validate: value => (value !== undefined && value !== '') || 'Please enter namespace\'s name',
            });
        }

        if (_.isUndefined(shouldMakeDefaultRe) && !noQuestions) {
            questions.push({
                type: 'confirm',
                name: 'shouldMakeDefaultRe',
                default: INSTALLATION_DEFAULTS.MAKE_DEFAULT_RE,
                message: 'Set this as the default runtime environment for your Codefresh account? (Y/N)',
            });
        }

        if (_.isUndefined(shouldExecutePipeline) && !noQuestions) {
            questions.push({
                type: 'confirm',
                name: 'shouldExecutePipeline',
                default: INSTALLATION_DEFAULTS.RUN_DEMO_PIPELINE,
                message: 'Run demo pipeline after install? (Y/N)',
            });
        }

        console.log(colors.green('This installer will guide you through the Codefresh Runner installation process'));
        const answers = await inquirer.prompt(questions);
        kubeContextName = kubeContextName || answers.context;
        kubeNamespace = kubeNamespace || answers.namespace;
        shouldMakeDefaultRe = shouldMakeDefaultRe || answers.shouldMakeDefaultRe;
        shouldExecutePipeline = shouldExecutePipeline || answers.shouldExecutePipeline;

        console.log(colors.green(`\nInstallation options summary: 
${colors.white('1. Kubernetes Context:')} ${colors.cyan(kubeContextName)}
${colors.white('2. Kubernetes Namespace:')} ${colors.cyan(kubeNamespace)}
${colors.white('3. Set this as default account runtime-environment:')} ${colors.cyan(shouldMakeDefaultRe)}
${colors.white('4. Execute demo pipeline after install:')} ${colors.cyan(shouldExecutePipeline)}
`));

        if (token) { // Add context
            await createContext.handler({
                apiKey: token,
                name: 'cf-runner',
                url,
            });
            const config = await getConfigForSdk();
            await sdk.configure(config);
            console.log('A Codefresh context named "cf-runner" was added to your "cfconfig" file.');
        }

        // Install runner and runtime
        await installAgent.handler({
            name,
            'kube-context-name': kubeContextName,
            'kube-node-selector': kubeNodeSelector,
            'dry-run': dryRun,
            'in-cluster': inCluster,
            'kube-namespace': kubeNamespace,
            'kubernetes-runner-type': kubernetesRunnerType,
            tolerations,
            'venona-version': venonaVersion,
            'kube-config-path': kubeConfigPath,
            'skip-version-check': skipVersionCheck,
            'install-runtime': true,
            verbose,
            'make-default-runtime': shouldMakeDefaultRe,
            terminateProcess: false,
            createDemoPipeline: true,
            executeDemoPipeline: shouldExecutePipeline,
        });
        console.log(colors.green('Runner Status:\n'));
        await getAgents.handler({});
        console.log(colors.green(`\nDocumenation link: ${colors.blue('https://codefresh.io/docs/docs/enterprise/codefresh-runner/#codefresh-runner-preview-release')}`));
        console.log(colors.green(`\nIf you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = initCmd;
