/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const colors = require('colors');
const _ = require('lodash');
const cliProgress = require('cli-progress');
const { getAllKubeContexts, getKubeContext, getAllNamespaces } = require('../../helpers/kubernetes');
const installAgent = require('../agent/install.cmd');
const installMonitoring = require('../monitor/install.cmd');
const createContext = require('../auth/create-context.cmd');
const getAgents = require('../agent/get.cmd');
const { getConfigForSdk } = require('../../commad-line-interface');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const installationProgress = require('./installation-process');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { createErrorHandler, DefaultLogFormatter } = require('./helper');
const {
    getTestPipeline,
    createTestPipeline,
    executeTestPipeline,
    updateTestPipelineRuntime,
    drawCodefreshFiglet,
    INSTALLATION_DEFAULTS,
} = require('./helper');
const {
    components, Runner, Downloader, CommonProgressFormat,
} = require('./../../../../binary');

const handleError = createErrorHandler(`\nIf you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`);

async function createAndRunTestPipeline(runtimeName, errHandler, progressReporter) {
    let testPipeline;
    const [getPipelineErr, _testPipeline] = await to(getTestPipeline(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME));
    testPipeline = _testPipeline;
    await errHandler(getPipelineErr, 'Could not get test pipeline', progressReporter, installationProgress.events.PIPELINE_CREATED);
    if (!testPipeline) {
        // eslint-disable-next-line no-shadow
        const [createPipelineErr, _testPipeline] = await to(createTestPipeline(
            runtimeName,
            INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME,
            ['echo hello codefresh runner!'],
            progressReporter,
        ));
        await errHandler(createPipelineErr, 'Failed to create test pipeline', progressReporter, installationProgress.events.PIPELINE_CREATED);
        testPipeline = _testPipeline;
    } else {
        const [updatePipelineErr] = await to(updateTestPipelineRuntime(testPipeline, runtimeName));
        if (updatePipelineErr) {
            console.log(colors.yellow('*warning* failed to update test pipeline runtime, you can' +
                ' change it manually if you want to run it again on this runtime'));
        }
    }
    console.log(`${colors.yellow('*NOTE* Running a pipeline for the first time might take longer than usual.')}`);
    const [runPipelineErr] = await to(executeTestPipeline(
        runtimeName,
        testPipeline,
        progressReporter,
    ));
    await errHandler(runPipelineErr, 'Failed to run test pipeline', progressReporter, installationProgress.events.PIPELINE_EXECUTED);
}

async function getRecommendedKubeNamespace(kubeconfigPath, kubeContextName) {
    const defaultName = INSTALLATION_DEFAULTS.NAMESPACE;
    const [err, namespaces] = await to(getAllNamespaces(kubeconfigPath, kubeContextName));
    let name;

    if (err || !_.isArray(namespaces) || !_.find(namespaces, ns => ns === defaultName)) {
        name = defaultName; // use the default name if there are no collisions
    } else {
        const namespacesSet = new Set(namespaces); // for fast lookup
        let i = 1;
        while (namespacesSet.has(`${defaultName}-${i}`)) {
            i += 1;
        }
        name = `${defaultName}-${i}`;
    }

    return name;
}

async function isNewAccount() {
    const [pipelines, err] = await to(sdk.pipelines.list({ }));
    if (!err && _.isArray(_.get(pipelines, 'docs'))) {
        return !pipelines.docs.length;
    }

    return false;
}

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
        .option('yes', {
            describe: 'Use installation defaults (don\'t ask any questions)',
            alias: 'y',
            type: 'boolean',
        })
        .option('skip-cluster-test', {
            describe: 'Do not test given kubeconfig context to have all the required permission',
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
        .option('kube-namespace', {
            describe: 'Name of the namespace on which venona should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('tolerations', {
            describe: 'The kubernetes tolerations as path to a  JSON file to be used by venona resources (default is no tolerations) (string)',
        })
        .option('storage-class-name', {
            describe: 'Set a name of your custom storage class',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('set-value', {
            describe: 'Set values for templates, example: --set-value LocalVolumesDir=/mnt/disks/ssd0/codefresh-volumes',
        })
        .option('set-file', {
            describe: 'Set values for templates from file, example: --set-file Storage.GoogleServiceAccount=/path/to/service-account.json',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'kube-node-selector': kubeNodeSelector,
            tolerations,
            'kube-config-path': kubeConfigPath,
            'storage-class-name': storageClassName,
            yes: noQuestions,
            verbose,
            name, url,
            token,
            'set-value': setValue,
            'set-file': setFile,
            'skip-cluster-test': skipClusterTest,
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
            kubeNamespace = await getRecommendedKubeNamespace(kubeConfigPath, kubeContextName);
            shouldMakeDefaultRe = INSTALLATION_DEFAULTS.MAKE_DEFAULT_RE;
            shouldExecutePipeline = INSTALLATION_DEFAULTS.RUN_DEMO_PIPELINE;
        } else {
            console.log(colors.green('This installer will guide you through the Codefresh Runner installation process'));
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
                kubeContextName = answer.context; // need this to set the default kube namespace in the next question
            }

            const questions = [];
            if (!kubeNamespace) {
                questions.push({
                    type: 'input',
                    name: 'namespace',
                    default: await getRecommendedKubeNamespace(kubeConfigPath, kubeContextName),
                    message: 'Kubernetes namespace to install into (will be created if it does not exist)',
                    validate: value => (value !== undefined && value !== '') || 'Please enter namespace\'s name',
                });
            }

            if (_.isUndefined(shouldMakeDefaultRe)) {
                if (_.get(sdk, 'config.context.isNoAuth') || await isNewAccount()) {
                    // if this is a new account, don't ask and set this runtime as default
                    shouldMakeDefaultRe = true;
                } else {
                    let message = 'Set this as the default runtime environment for your Codefresh account? (Y/N)';

                    const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
                    if (listReErr) {
                        console.debug('Failed to fetch runtimes');
                    } else {
                        const defaultRe = _.find(runtimes, re => re.default);
                        if (defaultRe) {
                            message = `Change the current default runtime "${colors.cyan(defaultRe.metadata.name)}" to new runtime ?`;
                        }
                    }

                    questions.push({
                        type: 'confirm',
                        name: 'shouldMakeDefaultRe',
                        default: INSTALLATION_DEFAULTS.MAKE_DEFAULT_RE,
                        message,
                    });
                }
            }

            if (_.isUndefined(shouldExecutePipeline)) {
                questions.push({
                    type: 'confirm',
                    name: 'shouldExecutePipeline',
                    default: INSTALLATION_DEFAULTS.RUN_DEMO_PIPELINE,
                    message: 'Run demo pipeline after install?',
                });
            }

            const answers = await inquirer.prompt(questions);
            kubeContextName = kubeContextName || answers.context;
            kubeNamespace = kubeNamespace || answers.namespace;
            shouldMakeDefaultRe = _.isUndefined(shouldMakeDefaultRe) ? answers.shouldMakeDefaultRe : shouldMakeDefaultRe;
            shouldExecutePipeline = _.isUndefined(shouldExecutePipeline) ? answers.shouldExecutePipeline : shouldExecutePipeline;
        }

        console.log(`\n${colors.green('Installation options summary:')} 
1. Kubernetes Context: ${colors.cyan(kubeContextName)}
2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
3. Set this as default account runtime-environment: ${colors.cyan(!!shouldMakeDefaultRe)}
4. Execute demo pipeline after install: ${colors.cyan(!!shouldExecutePipeline)}
`);

        const [, progress] = await to(async () => installationProgress.create(sdk['runner-installation'], {
            options: {
                kubeContextName,
                kubeNamespace,
                shouldMakeDefaultRe,
                shouldExecutePipeline,
            },
        }));

        const progressReporter = installationProgress.buildReporter(sdk['runner-installation'], progress);

        const downloader = new Downloader({
            progress: new cliProgress.SingleBar(
                {
                    stopOnComplete: true,
                    format: CommonProgressFormat,
                },
                cliProgress.Presets.shades_classic,
            ),
        });
        await downloader.download(components.venona);
        const componentRunner = new Runner();

        if (skipClusterTest) {
            console.log('Skipping cluster requirements tests.');
        } else {
            const cmd = ['test', '--log-formtter', DefaultLogFormatter];
            if (kubeNamespace) {
                cmd.push('--kube-namespace');
                cmd.push(kubeNamespace);
            }
            if (kubeConfigPath) {
                cmd.push('--kube-config-path');
                cmd.push(kubeConfigPath);
            }
            const [err] = await to(componentRunner.run(components.venona, cmd));
            await handleError(err, 'Failed to run cluster test');
        }

        if (token) {
            // Create a new context and switch to that context
            const createContextOptions = {
                apiKey: token,
                name: INSTALLATION_DEFAULTS.CF_CONTEXT_NAME,
                url,
            };
            const [err] = await to(createContext.handler(createContextOptions));
            await handleError(err, 'Failed to use the provided token');
            const config = await getConfigForSdk();
            await sdk.configure(config);
            console.log(`A Codefresh context named '${INSTALLATION_DEFAULTS.CF_CONTEXT_NAME}' was added to your "cfconfig" file.`);
        }

        // Install runner and runtime
        const agentInstallOptions = {
            name,
            'kube-context-name': kubeContextName,
            'kube-node-selector': kubeNodeSelector,
            'kube-namespace': kubeNamespace,
            tolerations,
            'kube-config-path': kubeConfigPath,
            'install-runtime': true,
            verbose,
            'make-default-runtime': shouldMakeDefaultRe,
            'storage-class-name': storageClassName,
            terminateProcess: false,
            'set-value': setValue,
            'set-file': setFile,
            'agent-kube-context-name': kubeContextName,
            'agent-kube-namespace': kubeNamespace,
        };
        const [runnerErr, runtimeName] = await to(installAgent.handler(agentInstallOptions));
        await handleError(runnerErr, 'Runner installation failed', progressReporter, installationProgress.events.RUNNER_INSTALLED);
        await to(progressReporter.report(installationProgress.events.RUNNER_INSTALLED, installationProgress.status.SUCCESS));

        // Install monitoring
        const monitorInstallOptions = {
            'kube-config-path': kubeConfigPath,
            'cluster-id': kubeContextName,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            token: _.get(sdk, 'config.context.token'),
            verbose,
            noExit: true, // to prevent if from calling inner: process.exit()
        };
        const [monitorErr] = await to(installMonitoring.handler(monitorInstallOptions));
        await handleError(monitorErr, 'Monitor installation failed', progressReporter, installationProgress.events.MONITOR_INSTALLED);
        await to(progressReporter.report(installationProgress.events.MONITOR_INSTALLED, installationProgress.status.SUCCESS));

        // Post Installation
        if (shouldExecutePipeline) {
            await createAndRunTestPipeline(runtimeName, handleError, progressReporter);
        }

        console.log(colors.green('\nRunner Status:'));
        await getAgents.handler({});
        console.log(colors.green(`\nGo to ${colors.blue('https://g.codefresh.io/kubernetes/monitor/services')} to view your cluster in codefresh dashbaord`));
        console.log(colors.green(`\nDocumenation link: ${colors.blue('https://codefresh.io/docs/docs/enterprise/codefresh-runner/#codefresh-runner-preview-release')}`));
        console.log(colors.green(`If you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
        await to(progressReporter.report(installationProgress.events.FINISHED, installationProgress.status.SUCCESS));
        await drawCodefreshFiglet();
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = initCmd;
