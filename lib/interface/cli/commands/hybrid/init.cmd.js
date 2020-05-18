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

const INSTALLATION_DEFAULTS = {
    NAMESPACE: 'codefresh',
    MAKE_DEFAULT_RE: true,
    RUN_DEMO_PIPELINE: true,
    DEMO_PIPELINE_NAME: 'Codefresh-Runner Demo',
    CF_CONTEXT_NAME: 'cf-runner',
};

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

async function createDemoPipeline(runtimeName) {
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
}

async function createAndExecuteDemoPipeline(runtimeName) {
    let demoPipelineExists = false;

    try {
        const pipelines = await sdk.pipelines.list({ id: INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME });
        if (_.get(pipelines, 'docs.length')) {
            demoPipelineExists = true;
        }
    } catch (error) {
        console.log(`Failed to fetch account pipelines, cause: ${error.message}`);
    }

    if (!demoPipelineExists) {
        console.log(`Creating demo pipeline with the name: "${colors.cyan(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME)}"`);
        try {
            await createDemoPipeline(runtimeName);
        } catch (error) {
            console.log(`${colors.red('Error: ')} Failed to create demo pipeline, cause: ${prettyError(error)}`);
        }
    } else {
        console.log(`Demo pipeline with the name: "${colors.cyan(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME)}" already exists`);
    }

    console.log(`${colors.yellow('*NOTE* Running a pipeline for the first time might take longer than usual.')}`);
    console.log(`Executing pipeline "${colors.cyan(INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME)}"`);
    await pipelinesRunCmd.handler({
        name: INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME,
        exitProcess: false,
        annotation: [],
    });
}

async function getRecommendedKubeNamespace(kubeconfigPath, kubeContextName) {
    const defaultName = INSTALLATION_DEFAULTS.NAMESPACE;
    const namespaces = await getAllNamespaces(kubeconfigPath, kubeContextName);
    let name;

    if (!_.isArray(namespaces) || !_.find(namespaces, ns => ns === defaultName)) {
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
        .option('storage-class-name', {
            describe: 'Set a name of your custom storage class, note: this will not install volume provisioning components',
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
            'storage-class-name': storageClassName,
            yes: noQuestions,
            verbose,
            name, url,
        } = argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'set-default-runtime': shouldMakeDefaultRe,
            'exec-demo-pipeline': shouldExecutePipeline,
            token,
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
            if (!kubeContextName && !noQuestions) {
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
            const questions = [];
            if (!kubeNamespace && !noQuestions) {
                questions.push({
                    type: 'input',
                    name: 'namespace',
                    default: await getRecommendedKubeNamespace(kubeConfigPath, kubeContextName),
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

        if (token) { // Add context
            try {
                await createContext.handler({
                    apiKey: token,
                    name: INSTALLATION_DEFAULTS.CF_CONTEXT_NAME,
                    url,
                });
                const config = await getConfigForSdk();
                await sdk.configure(config);
                console.log(`A Codefresh context named '${INSTALLATION_DEFAULTS.CF_CONTEXT_NAME}' was added to your "cfconfig" file.`);
            } catch (error) {
                console.log(`${colors.red('Error:')} Could not use the provided token, failed with error: ${prettyError(error)}`);
                process.exit(1);
            }
        } else {
            token = _.get(sdk, 'config.context.token');
        }

        // Install runner and runtime
        let runtimeName;
        try {
            runtimeName = await installAgent.handler({
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
                'storage-class-name': storageClassName,
                terminateProcess: false,
            });
        } catch (error) {
            console.log(`${colors.red('Error: ')} Runner installation failed with error: ${prettyError(error)}`);
            process.exit(1);
        }

        // Install monitoring
        await installMonitoring.handler({
            'kube-config-path': kubeConfigPath,
            'cluster-id': kubeContextName,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            token,
            verbose,
            noExit: true, // to prevent if from calling: process.exit()
        });

        // Post Installation
        if (shouldExecutePipeline) {
            await createAndExecuteDemoPipeline(runtimeName);
        }

        console.log(colors.green('\nRunner Status:'));
        await getAgents.handler({});
        console.log(colors.green(`\nGo to ${colors.blue('https://g.codefresh.io/kubernetes/monitor/services')} to view your cluster in codefresh dashbaord`));
        console.log(colors.green(`\nDocumenation link: ${colors.blue('https://codefresh.io/docs/docs/enterprise/codefresh-runner/#codefresh-runner-preview-release')}`));
        console.log(colors.green(`If you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`));
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = initCmd;
