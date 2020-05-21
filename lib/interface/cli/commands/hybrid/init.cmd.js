/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const { getAllKubeContexts, getKubeContext, getAllNamespaces } = require('../../helpers/kubernetes');
const installAgent = require('../agent/install.cmd');
const pipelinesRunCmd = require('../pipeline/run.cmd');
const installMonitoring = require('../monitor/install.cmd');
const createContext = require('../auth/create-context.cmd');
const getAgents = require('../agent/get.cmd');
const { getConfigForSdk } = require('../../commad-line-interface');
const colors = require('colors');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const installationProgress = require('./installation-process');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { prettyError } = require('../../../../logic/cli-config/errors/helpers');

const INSTALLATION_DEFAULTS = {
    NAMESPACE: 'codefresh',
    MAKE_DEFAULT_RE: true,
    RUN_DEMO_PIPELINE: true,
    DEMO_PIPELINE_NAME: 'Codefresh-Runner Demo',
    CF_CONTEXT_NAME: 'cf-runner',
};

async function handleError(error, message, progressReporter, event) {
    if (!error) {
        return;
    }
    if (progressReporter) {
        await to(progressReporter.report(event, installationProgress.status.FAILURE));
    }
    console.log(`${colors.red('Error:')} ${message}: ${prettyError(error)}`);
    console.log(colors.green(`\nIf you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
    process.exit(1);
}

async function createDemoPipeline(runtimeName, progressReporter) {
    const pipeline = await sdk.pipelines.create({ metadata: { name: INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME } });
    pipeline.spec.runtimeEnvironment = {
        name: runtimeName,
    };
    pipeline.spec.steps = {};
    pipeline.spec.stages = ['test'];
    pipeline.spec.steps.test = {
        stage: 'test',
        title: 'test',
        image: 'alpine:latest',
        commands: ['echo hello codefresh runner!'],
    };

    await sdk.pipelines.replace(
        { name: INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME },
        {
            kind: pipeline.kind,
            spec: pipeline.spec,
            metadata: pipeline.metadata,
            version: pipeline.version,
        },
    );

    await to(progressReporter.report(installationProgress.events.PIPELINE_CREATED, installationProgress.status.SUCCESS));
}

async function createAndExecuteDemoPipeline(runtimeName, progressReporter) {
    let demoPipelineExists = false;

    const [getPipelinesError, pipelines] = await to(sdk.pipelines.list({ id: INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME }));
    if (getPipelinesError) {
        console.log(`Failed to fetch account pipelines, cause: ${getPipelinesError.message}`);
    } else if (_.get(pipelines, 'docs.length')) {
        demoPipelineExists = true;
    }

    if (!demoPipelineExists) {
        console.log(`Creating demo pipeline with the name: "${colors.cyan(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME)}"`);
        const [createDemoPipelineError] = await to(createDemoPipeline(runtimeName, progressReporter));
        await handleError(createDemoPipelineError, 'Failed to create demo pipeline', progressReporter, installationProgress.events.PIPELINE_CREATED);
    } else {
        console.log(`Demo pipeline with the name: "${colors.cyan(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME)}" already exists`);
    }

    console.log(`${colors.yellow('*NOTE* Running a pipeline for the first time might take longer than usual.')}`);
    console.log(`Executing pipeline "${colors.cyan(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME)}"`);
    const [pipelineExecutionError] = await to(pipelinesRunCmd.handler({
        name: INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME,
        exitProcess: false,
        annotation: [],
        'runtime-name': runtimeName,
    }));
    await handleError(pipelineExecutionError, 'Failed to run demo pipeline', progressReporter, installationProgress.events.PIPELINE_EXECUTED);

    await to(progressReporter.report(installationProgress.events.PIPELINE_EXECUTED, installationProgress.status.SUCCESS));
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
                if (!_.get(sdk, 'config.context.isNoAuth') && await isNewAccount()) {
                    // if this is a new account, don't ask and set this runtime as default
                    shouldMakeDefaultRe = true;
                } else {
                    questions.push({
                        type: 'confirm',
                        name: 'shouldMakeDefaultRe',
                        default: INSTALLATION_DEFAULTS.MAKE_DEFAULT_RE,
                        message: 'Set this as the default runtime environment for your Codefresh account? (Y/N)',
                    });
                }
            }

            if (_.isUndefined(shouldExecutePipeline)) {
                questions.push({
                    type: 'confirm',
                    name: 'shouldExecutePipeline',
                    default: INSTALLATION_DEFAULTS.RUN_DEMO_PIPELINE,
                    message: 'Run demo pipeline after install? (Y/N)',
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
            await createAndExecuteDemoPipeline(runtimeName, progressReporter);
        }

        console.log(colors.green('\nRunner Status:'));
        await getAgents.handler({});
        console.log(colors.green(`\nGo to ${colors.blue('https://g.codefresh.io/kubernetes/monitor/services')} to view your cluster in codefresh dashbaord`));
        console.log(colors.green(`\nDocumenation link: ${colors.blue('https://codefresh.io/docs/docs/enterprise/codefresh-runner/#codefresh-runner-preview-release')}`));
        console.log(colors.green(`If you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
        await to(progressReporter.report(installationProgress.events.FINISHED, installationProgress.status.SUCCESS));
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = initCmd;
