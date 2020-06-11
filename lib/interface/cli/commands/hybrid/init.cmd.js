/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const colors = require('colors');
const _ = require('lodash');
const { getAllKubeContexts, getKubeContext } = require('../../helpers/kubernetes');
const installMonitoring = require('../monitor/install.cmd');
const createClusterCmd = require('../cluster/create.cmd');
const createContext = require('../auth/create-context.cmd');
const getAgents = require('../agent/get.cmd');
const { getConfigForSdk } = require('../../commad-line-interface');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const installationProgress = require('./installation-process');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { createErrorHandler } = require('./helper');
const {
    createTestPipeline,
    executeTestPipeline,
    updateTestPipelineRuntime,
    drawCodefreshFiglet,
    getDefaultRuntime,
    getRecommendedKubeNamespace,
    runClusterAcceptanceTests,
    installAgent,
    installRuntime,
    attachRuntime,
    newRuntimeName,
    newAgentName,
    parseNodeSelector,
    INSTALLATION_DEFAULTS,
} = require('./helper');
const InstallationPlan = require('./InstallationPlan');

const handleError = createErrorHandler(`\nIf you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`);

async function isNewAccount() {
    const [pipelines, err] = await to(sdk.pipelines.list({ }));
    if (!err && _.isArray(_.get(pipelines, 'docs'))) {
        return !pipelines.docs.length;
    }

    return false;
}

function printInstallationOptionsSummary({
    kubeContextName,
    kubeNamespace,
    shouldMakeDefaultRe,
    shouldExecutePipeline,
}) {
    console.log(`\n${colors.green('Installation options summary:')} 
    1. Kubernetes Context: ${colors.cyan(kubeContextName)}
    2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
    3. Set this as default account runtime-environment: ${colors.cyan(!!shouldMakeDefaultRe)}
    4. Execute demo pipeline after install: ${colors.cyan(!!shouldExecutePipeline)}
    `);
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
        .option('build-node-selector', {
            describe: 'The kubernetes node selector "key=value" to be used by the codefresh build resources (default is no node selector)',
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
        let resumedInstallation = false;

        const oldInstallationPlan = InstallationPlan.restorePreviousState();
        if (oldInstallationPlan) {
            console.log(colors.cyan('Previous installation state:'));
            oldInstallationPlan.printState();
            oldInstallationPlan.reset(); // needs to be called after printState()
            const answer = await inquirer.prompt({
                type: 'confirm',
                name: 'resumeInstallation',
                default: INSTALLATION_DEFAULTS.RESUME_OLD_INSTALLATION,
                message: 'Detected previous incomplete installation, do you want to resume this installation?',
            });
            resumedInstallation = answer.resumeInstallation;
        }

        let _argv = argv;
        if (resumedInstallation) {
            _argv = Object.assign(oldInstallationPlan.getContext('argv'), _argv); // restore previous installation environment
        }

        const {
            'kube-node-selector': kubeNodeSelector,
            'build-node-selector': buildNodeSelector,
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
        } = _argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'set-default-runtime': shouldMakeDefaultRe,
            'exec-demo-pipeline': shouldExecutePipeline,
        } = _argv;

        if (_.get(sdk, 'config.context.isNoAuth') && !token) {
            console.log('Not authenticated as a Codefresh account: ');
            console.log('In order to install a Codefresh Runner you need to provide ' +
                `an authentication token which can be generated here: ${colors.blue(`${_argv.url}/user/settings`)}` +
                '\nAfter getting the token you may run this command again with the [--token] option or use the \'codefresh auth\' command to create an authenticated context.');
            process.exit(1);
        }

        if (noQuestions) {
            // use defaults
            kubeContextName = getKubeContext(kubeConfigPath);
            kubeNamespace = await getRecommendedKubeNamespace(kubeConfigPath, kubeContextName);
            shouldMakeDefaultRe = INSTALLATION_DEFAULTS.MAKE_DEFAULT_RE;
            shouldExecutePipeline = INSTALLATION_DEFAULTS.RUN_DEMO_PIPELINE;
        } else if (!resumedInstallation) {
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
                    // don't ask and set this runtime as default if it's a new account
                    shouldMakeDefaultRe = true;
                } else {
                    let message = 'Set this as the default runtime environment for your Codefresh account? (Y/N)';
                    const [, defaultRe] = await to(getDefaultRuntime());
                    if (defaultRe) {
                        message = `Change the current default runtime "${colors.cyan(defaultRe.metadata.name)}" to new runtime ?`;
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

        printInstallationOptionsSummary({
            kubeContextName,
            kubeNamespace,
            shouldMakeDefaultRe,
            shouldExecutePipeline,
        });

        if (token) {
            // Create a new context and switch to that context
            const [err] = await to(createContext.handler({
                apiKey: token,
                name: INSTALLATION_DEFAULTS.CF_CONTEXT_NAME,
                url,
            }));
            await handleError(err, 'Failed to use the provided token');
            const config = await getConfigForSdk();
            await sdk.configure(config);
            console.log(`A Codefresh context named '${INSTALLATION_DEFAULTS.CF_CONTEXT_NAME}' was added to your "cfconfig" file.`);
        }

        const [, progress] = await to(async () => installationProgress.create(sdk['runner-installation'], {
            options: {
                kubeContextName,
                kubeNamespace,
                shouldMakeDefaultRe,
                shouldExecutePipeline,
            },
        }));
        const progressReporter = installationProgress.buildReporter(sdk['runner-installation'], progress);

        let installationPlan;
        if (resumedInstallation) {
            installationPlan = oldInstallationPlan;
            installationPlan.setErrorHandler(handleError);
            installationPlan.setProgressReporter(progressReporter);
        } else {
            installationPlan = new InstallationPlan({ progressReporter, errHandler: handleError });
        }

        // save the answers for backup
        _argv['kube-context-name'] = kubeContextName;
        _argv['kube-namespace'] = kubeNamespace;
        _argv['set-default-runtime'] = shouldMakeDefaultRe;
        _argv['exec-demo-pipeline'] = shouldExecutePipeline;
        installationPlan.addContext('argv', _argv);

        // run cluster acceptance tests
        installationPlan.addStep({
            name: 'run cluster acceptance tests',
            func: runClusterAcceptanceTests,
            arg: { kubeNamespace, kubeConfigPath },
            installationEvent: installationProgress.events.ACCEPTANCE_TESTS_RAN,
            condition: !skipClusterTest,
        });

        // generate new agent name
        installationPlan.addContext('agentName', name);
        installationPlan.addStep({
            name: 'generate new agent name',
            func: async (contextName, namespace) => {
                const agentName = await newAgentName(contextName, namespace);
                installationPlan.addContext('agentName', agentName);
            },
            args: [kubeContextName, kubeNamespace],
            condition: async () => !installationPlan.getContext('agentName'),
        });

        // create new agent
        installationPlan.addStep({
            name: 'create new agent',
            func: async () => {
                const agentName = installationPlan.getContext('agentName');
                const agent = await sdk.agents.create({ name: agentName });
                installationPlan.addContext('agent', agent);
                const { token: agentToken } = agent;
                console.log(`A Codefresh Runner with the name: ${colors.cyan(agentName)} has been created.` +
                    `\n${colors.yellow('*IMPORTANT*')} Make sure to copy your access token now and st` +
                    'ore it in a safe location. You won’t be able to see it again.');
                console.log(agentToken);
                installationPlan.addContext('agentToken', agentToken);
            },
            condition: async () => !installationPlan.getContext('agentToken'),
        });

        // install agent
        installationPlan.addStep({
            name: 'install new agent',
            func: async () => {
                await installAgent({
                    apiHost: sdk.config.context.url,
                    kubeContextName,
                    kubeNamespace,
                    token: installationPlan.getContext('agentToken'),
                    kubeNodeSelector,
                    tolerations,
                    kubeConfigPath,
                    verbose,
                    agentId: installationPlan.getContext('agentName'),
                });
            },
        });

        // generate new runtime name
        installationPlan.addStep({
            name: 'generate new runtime name',
            func: async (contextName, namespace) => {
                const reName = await newRuntimeName(contextName, namespace);
                installationPlan.addContext('runtimeName', reName);
            },
            args: [kubeContextName, kubeNamespace],
            condition: async () => !installationPlan.getContext('runtimeName'),
        });

        // create new runtime
        installationPlan.addStep({
            name: 'create new runtime',
            func: async () => {
                const runtimeCreateOpt = {
                    namespace: kubeNamespace,
                    storageClassName: storageClassName || `${INSTALLATION_DEFAULTS.STORAGE_CLASS_PREFIX}-${kubeNamespace}`,
                    clusterName: kubeContextName,
                    runtimeEnvironmentName: installationPlan.getContext('runtimeName'),
                    agent: true,
                };

                if (buildNodeSelector) {
                    runtimeCreateOpt.nodeSelector = parseNodeSelector(buildNodeSelector);
                }

                await sdk.cluster.create(runtimeCreateOpt);
            },
        });

        // set runtime as default
        installationPlan.addStep({
            name: 'set new runtime as default',
            func: async () => {
                const reName = installationPlan.getContext('runtimeName');
                const re = await sdk.runtimeEnvs.get({
                    name: reName,
                });
                await sdk.runtimeEnvs.setDefault({ account: re.accountId, name: re.metadata.name });
                console.log(`Runtime environment "${colors.cyan(reName)}" has been set as the default runtime`);
            },
            condition: shouldMakeDefaultRe,
        });

        // add cluster integration
        installationPlan.addStep({
            name: 'add cluster integration',
            func: async () => {
                await createClusterCmd.handler({
                    'kube-context': kubeContextName,
                    namespace: kubeNamespace,
                    'behind-firewall': true,
                    serviceaccount: 'default',
                    terminateProcess: false,
                });
            },
            condition: async () => {
                const clusters = await sdk.clusters.list() || [];
                if (clusters.find(cluster => cluster.selector === kubeContextName)) {
                    return false; // cluster already exists
                }
                return true;
            },
        });

        // install runtime on cluster
        installationPlan.addStep({
            name: 'install runtime',
            func: async () => {
                await installRuntime({
                    apiHost: sdk.config.context.url,
                    name: installationPlan.getContext('runtimeName'),
                    kubeContextName,
                    kubeNamespace,
                    token: sdk.config.context.token,
                    kubeConfigPath,
                    verbose,
                    kubeNodeSelector,
                    setValue,
                    setFile,
                    storageClassName,
                });
            },
        });

        // update agent with new runtime
        installationPlan.addStep({
            name: 'update agent with new runtime',
            func: async () => {
                const reName = installationPlan.getContext('runtimeName');
                const agent = installationPlan.getContext('agent');
                const rt = await sdk.runtimeEnvs.get({ name: reName });
                if (!rt) {
                    throw new Error(`runtime ${reName} does not exist on the account`);
                }
                if (!rt.metadata.agent) {
                    throw new Error('cannot attach non hybrid runtime');
                }
                const runtimes = _.get(agent, 'runtimes', []);
                const existingRT = _.find(runtimes, value => value === reName);
                if (!existingRT) {
                    runtimes.push(reName);
                    await sdk.agents.update({ agentId: agent.id, runtimes });
                } else {
                    throw new Error(`Runtime ${name} already attached`);
                }
            },
        });

        // attach runtime to agent
        installationPlan.addStep({
            name: 'attach runtime to agent',
            func: async () => {
                await attachRuntime({
                    kubeContextName, // kube-context-name
                    kubeNamespace, // --kube-namespace
                    kubeConfigPath, // --kube-config-path
                    agentKubeContextName: kubeContextName, // --kube-context-name-agent
                    agentKubeNamespace: kubeNamespace, // --kube-namespace-agent
                    agentKubeConfigPath: kubeConfigPath, // --kube-config-path-agent
                    restartAgent: true, // --restart-agent
                    verbose, // --verbose
                    runtimeName: installationPlan.getContext('runtimeName'), // --runtimeName
                });
            },
            installationEvent: installationProgress.events.RUNNER_INSTALLED,
        });

        // install monitoring
        installationPlan.addStep({
            name: 'install cluster monitoring',
            func: installMonitoring.handler,
            arg: {
                'kube-config-path': kubeConfigPath,
                'cluster-id': kubeContextName,
                'kube-context-name': kubeContextName,
                'kube-namespace': kubeNamespace,
                token: _.get(sdk, 'config.context.token'),
                verbose,
                noExit: true, // to prevent if from calling inner: process.exit()
            },
            successMessage: 'Successfully installed cluster monitoring',
            installationEvent: installationProgress.events.MONITOR_INSTALLED,
        });

        // Post Installation
        if (shouldExecutePipeline) {
            const pipelines = await sdk.pipelines.list({ id: `${INSTALLATION_DEFAULTS.PROJECT_NAME}/${INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME}` });
            const testPipelineExists = !!_.get(pipelines, 'docs.length');
            if (!testPipelineExists) {
                installationPlan.addStep({
                    name: 'create test pipeline',
                    func: async () => {
                        await createTestPipeline(
                            installationPlan.getContext('runtimeName'),
                            INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME,
                            ['echo hello codefresh runner!'],
                        );
                    },
                    installationEvent: installationProgress.events.PIPELINE_CREATED,
                });
            } else {
                installationPlan.addStep({
                    name: 'update test pipeline runtime',
                    func: async () => {
                        await updateTestPipelineRuntime(
                            undefined,
                            installationPlan.getContext('runtimeName'),
                            INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME,
                        );
                    },
                    errMessage: colors.yellow('*warning* could not update test pipeline runtime, you can' +
                        ' change it manually if you want to run it again on this runtime'),
                    successMessage: 'Updated test pipeline runtime',
                    exitOnError: false,
                });
            }
            installationPlan.addStep({
                name: 'execute test pipeline',
                func: async () => {
                    await executeTestPipeline(
                        installationPlan.getContext('runtimeName'),
                        INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME,
                    );
                },
                errMessage: 'Failed to execute test pipeline',
                installationEvent: installationProgress.events.PIPELINE_EXECUTED,
            });
        }

        await installationPlan.execute();

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
