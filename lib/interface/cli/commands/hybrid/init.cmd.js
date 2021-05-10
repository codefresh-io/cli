/* eslint-disable max-len */
const fs = require('fs');

const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const colors = require('colors');
const _ = require('lodash');
const { addProxyVariables, detectProxy, keyValueArrayToObject } = require('../../helpers/general');
const { getAllKubeContexts, getKubeContext, isInCluster } = require('../../helpers/kubernetes');
const installMonitoring = require('../monitor/install.cmd');
const createClusterCmd = require('../cluster/create.cmd');
const createContext = require('../auth/create-context.cmd');
const getAgents = require('../agent/get.cmd');
const { getConfigForSdk } = require('../../commad-line-interface');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const installationProgress = require('./installation-process');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    drawCodefreshFiglet,
    getDefaultRuntime,
    getRecommendedKubeNamespace,
    runClusterAcceptanceTests,
    installAgent,
    installRuntime,
    installAppProxy,
    attachRuntime,
    newRuntimeName,
    newAgentName,
    keyValueAsStringToObject,
    getRuntimeImagesWithRegistryUrl,
    mergeValuesFromValuesFile,
    INSTALLATION_DEFAULTS,
} = require('./helper');
const InstallationPlan = require('./InstallationPlan');
const { produceVenonaKeys } = require('./key-helper');
const { array } = require('yargs');
const {
    addPipelineToInstallationPlan,
} = require('./pipeline-helper');

const defaultDockerRegistry = 'quay.io';
const handleError = createErrorHandler(`\nIf you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`);

async function isNewAccount() {
    const [pipelines, err] = await to(sdk.pipelines.list({}));
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
    httpProxy,
    httpsProxy,
    noProxy,
    appProxy,
    appProxyHost,
    dryRun,
    shouldUseHelm,
}) {
    let summary = `\n${colors.green('Installation options summary:')} 
    1. Kubernetes Context: ${colors.cyan(kubeContextName)}
    2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
    3. Set this as default account runtime-environment: ${colors.cyan(!!shouldMakeDefaultRe)}
    4. Execute demo pipeline after install: ${colors.cyan(!!shouldExecutePipeline)}
    5. HTTP proxy: ${httpProxy ? colors.cyan(httpProxy) : 'none'}
    6. HTTPS proxy: ${httpsProxy ? colors.cyan(httpsProxy) : 'none'} 
    7. No proxy: ${noProxy ? colors.cyan(noProxy) : 'none'} 
    `;

    if (appProxy) {
        summary += `7. App-Proxy hostname: ${colors.cyan(appProxyHost)}\n`;
    }
    if (dryRun) {
        summary += '**** running in dry-run mode ****';
    }
    if (shouldUseHelm) {
        summary += '**** running in helm values generation mode ****';
    }
    console.log(summary);
}

const initCmd = new Command({
    root: false,
    parent: runnerRoot,
    command: 'init',
    requiresAuthentication: false,
    description: 'Install Codefresh Runner solution\'s components on Kubernetes cluster',
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
        })
        .option('generate-helm-values-file', {
            describe: 'Path to the new generated helm values file',
            type: 'string',
        })
        .option('kube-context-name', {
            describe: 'Name of the Kubernetes context on which runner should be installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-node-selector', {
            describe: 'The Kubernetes node selector "key=value" to be used by runner build resources (default is no node selector) (string)',
        })
        .option('build-node-selector', {
            describe: 'The Kubernetes node selector "key=value" to be used by the Codefresh build resources (default is no node selector)',
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
        .option('skip-cluster-integration', {
            describe: 'Do not create a cluster integration in Codefresh',
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
        .option('install-monitor', {
            describe: 'Install a monitoring component that will help provide valueable data about your cluster to Codefresh',
            type: 'boolean',
            default: true,
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which runner should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('tolerations', {
            describe: 'The Kubernetes tolerations as path to a JSON file prefixed with @ to be used by runner resources (default is no tolerations) (string)',
        })
        .option('storage-class-name', {
            describe: 'Set a name of your custom storage class',
        })
        .option('docker-registry', {
            describe: `The prefix for the container registry that will be used for pulling the required components images. Example: --docker-registry="docker.io"  default is ${defaultDockerRegistry}`,
            type: 'string',
            default: defaultDockerRegistry,
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('values', {
            describe: 'specify values in a YAML file (see example here: https://github.com/codefresh-io/venona/blob/release-1.0/venonactl/example/values-example.yaml)',
        })
        .option('set-value', {
            describe: 'Set values for templates, example: --set-value LocalVolumesDir=/mnt/disks/ssd0/codefresh-volumes',
            type: array,
            default: [],
        })
        .option('set-file', {
            describe: 'Set values for templates from file, example: --set-file Storage.GoogleServiceAccount=/path/to/service-account.json',
            type: array,
            default: [],
        })
        .option('http-proxy', {
            describe: 'http proxy to be used in the runner',
        })
        .option('https-proxy', {
            describe: 'https proxy to be used in the runner',
        })
        .option('no-proxy', {
            describe: 'no_proxy to be used in the runner',
        })
        .option('verbose', {
            describe: 'Print logs',
        })
        .option('env-vars', {
            describe: 'Addiontal env vars to be used in all Codefresh components',
            type: array,
            default: [],
        })
        .option('app-proxy', {
            describe: 'install app proxy component (default false)',
            default: false,
            type: 'boolean',
        })
        .option('app-proxy-host', {
            describe: 'the hostname that will be used by the app-proxy ingress',
            type: 'string',
        })
        .option('app-proxy-ingress-class', {
            describe: 'the ingress class that will be used by the app-proxy ingress',
            type: 'string',
        })
        .option('docker-daemon-access', {
            describe: 'docker daemon access (default true)',
            default: true,
            type: 'boolean',
        })
        .option('dry-run', {
            describe: 'Will save all of the manifests to be deployed on the cluster to: ./manifests/',
            default: false,
            type: 'boolean',
        })
        .option('bypass-download', {
            describe: 'Will bypass the attempt to download the installer. Instead, will immediately attempt to use the binary from the components folder',
            default: false,
            type: 'boolean',
        })
        .example('codefresh runner init --values values.yaml (see values file example here: '
            + 'https://github.com/codefresh-io/venona/blob/release-1.0/venonactl/example/values-example.yaml)'),
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

        // if we are using a values file
        if (_argv.values) {
            _argv = mergeValuesFromValuesFile(_argv, _argv.values, handleError);
        }

        const {
            'kube-node-selector': kubeNodeSelector,
            'build-node-selector': buildNodeSelector,
            'generate-helm-values-file': helmValuesFile,
            tolerations,
            'kube-config-path': kubeConfigPath,
            'storage-class-name': storageClassName,
            verbose,
            values: valuesFile,
            'set-value': setValue,
            'set-file': setFile,
            'app-proxy-ingress-class': appProxyIngressClass,
            'env-vars': envVars,
            yes: noQuestions,
            'skip-cluster-test': skipClusterTest,
            'skip-cluster-integration': skipClusterIntegration,
            'docker-registry': dockerRegistry,
            token,
            name,
            'app-proxy': appProxy,
            'app-proxy-path-prefix': appProxyPathPrefix,
            'install-monitor': installMonitor,
            'docker-daemon-access': dockerDaemonAccess,
            runtimeName,
            reEnvVars,
            reResources,
            reTolerations,
            userVolumeMounts,
            userVolumes,
            'dry-run': dryRun,
            'bypass-download': bypassDownload,
        } = _argv;

        const shouldUseHelm = !!helmValuesFile;

        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'set-default-runtime': shouldMakeDefaultRe,
            'exec-demo-pipeline': shouldExecutePipeline,
            'http-proxy': httpProxy,
            'https-proxy': httpsProxy,
            'no-proxy': noProxy,
            'app-proxy-host': appProxyHost,
            url,
        } = _argv;

        if (!url) {
            url = DEFAULTS.URL;
        }

        if (_.get(sdk, 'config.context.isNoAuth') && !token) {
            console.log('Not authenticated as a Codefresh account: ');
            console.log('In order to install a Codefresh Runner you need to provide ' +
                `an authentication token which can be generated here: ${colors.blue(`${_argv.url}/user/settings`)}` +
                '\nAfter getting the token you may run this command again with the [--token] option or use the \'codefresh auth\' command to create an authenticated context.');
            process.exit(1);
        }

        const detectedProxyVars = detectProxy();
        httpProxy = httpProxy || detectedProxyVars.httpProxy;
        httpsProxy = httpsProxy || detectedProxyVars.httpsProxy;
        noProxy = noProxy || detectedProxyVars.noProxy;

        if (noQuestions) {
            // use defaults
            kubeContextName = kubeContextName || getKubeContext(kubeConfigPath);
            kubeNamespace = kubeNamespace || await getRecommendedKubeNamespace(kubeConfigPath, kubeContextName);
            shouldMakeDefaultRe = _.isUndefined(shouldMakeDefaultRe) ? INSTALLATION_DEFAULTS.MAKE_DEFAULT_RE : shouldMakeDefaultRe;
            shouldExecutePipeline = _.isUndefined(shouldExecutePipeline) ? INSTALLATION_DEFAULTS.RUN_DEMO_PIPELINE : shouldExecutePipeline;
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
            if (httpProxy) {
                questions.push({
                    type: 'input',
                    name: 'httpProxy',
                    default: httpProxy,
                    message: 'detected HTTP_PROXY, should I use this in all Codefresh components?',
                });
            }

            if (httpsProxy) {
                questions.push({
                    type: 'input',
                    name: 'httpsProxy',
                    default: httpsProxy,
                    message: 'detected HTTPS_PROXY, should I use this in all Codefresh components?',

                });
            }
            if (noProxy) {
                questions.push({
                    type: 'input',
                    name: 'noProxy',
                    default: noProxy,
                    message: 'detected NO_PROXY, should I use this in all Codefresh components?',

                });
            }

            if (appProxy && !appProxyHost) {
                // will only be asked if you want to install app-proxy but you give no host in the options
                questions.push({
                    type: 'input',
                    name: 'appProxyHost',
                    message: 'The hostname that will be used by the app-proxy ingress',
                });
            }

            if (_.isUndefined(shouldMakeDefaultRe)) {
                if (!_.get(sdk, 'config.context.isNoAuth') && await isNewAccount()) {
                    // don't ask and set this runtime as default if it's a new account
                    shouldMakeDefaultRe = true;
                } else {
                    let message = 'Set this as the default runtime environment for your Codefresh account?';
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
                    message: shouldUseHelm ? 'Create demo pipeline?' : 'Run demo pipeline after install?',
                });
            }

            const answers = await inquirer.prompt(questions);
            kubeContextName = kubeContextName || answers.context;
            kubeNamespace = kubeNamespace || answers.namespace;
            shouldMakeDefaultRe = _.isUndefined(shouldMakeDefaultRe) ? answers.shouldMakeDefaultRe : shouldMakeDefaultRe;
            shouldExecutePipeline = _.isUndefined(shouldExecutePipeline) ? answers.shouldExecutePipeline : shouldExecutePipeline;
            // eslint-disable-next-line object-curly-newline
            ({ httpProxy, httpsProxy, noProxy, appProxyHost } = answers);
        }

        printInstallationOptionsSummary({
            kubeContextName,
            kubeNamespace,
            shouldMakeDefaultRe,
            shouldExecutePipeline,
            httpProxy,
            httpsProxy,
            noProxy,
            appProxy,
            appProxyHost,
            dryRun,
            shouldUseHelm,
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

        const progress = dryRun ? {} : await installationProgress.create(sdk['runner-installation'], {
            options: {
                kubeContextName,
                kubeNamespace,
                shouldMakeDefaultRe,
                shouldExecutePipeline,
            },
        });
        const progressReporter = installationProgress.buildReporter(sdk['runner-installation'], progress);

        let installationPlan;
        if (resumedInstallation) {
            installationPlan = oldInstallationPlan;
            installationPlan.setErrorHandler(handleError);
            installationPlan.setProgressReporter(progressReporter);
        } else {
            installationPlan = new InstallationPlan({ progressReporter, errHandler: handleError });
        }

        addProxyVariables(envVars, { httpsProxy, httpProxy, noProxy });

        // save the answers for backup
        _argv['kube-context-name'] = kubeContextName;
        _argv['kube-namespace'] = kubeNamespace;
        _argv['set-default-runtime'] = shouldMakeDefaultRe;
        _argv['exec-demo-pipeline'] = shouldExecutePipeline;
        _argv['env-vars'] = envVars;
        _argv['app-proxy-host'] = appProxyHost;
        installationPlan.addContext('argv', _argv);

        // run cluster acceptance tests
        installationPlan.addStep({
            name: 'run cluster acceptance tests',
            func: runClusterAcceptanceTests,
            arg: {
                apiHost: sdk.config.context.url,
                kubeNamespace,
                kubeConfigPath,
                kubeContextName,
                dockerRegistry,
                envVars,
                verbose,
                valuesFile,
                setValue,
                setFile,
                bypassDownload,
            },
            installationEvent: installationProgress.events.ACCEPTANCE_TESTS_RAN,
            condition: !skipClusterTest && !shouldUseHelm,
        });

        // generate new agent name
        installationPlan.addContext('agentName', name ? name.trim() : name);
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
                console.log(`A Codefresh Runner with the name: ${colors.cyan(agentName)} has been created.`);
                installationPlan.addContext('agentToken', agentToken);
            },
            installationEvent: installationProgress.events.AGENT_CREATED,
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
                    dockerRegistry,
                    verbose,
                    agentId: installationPlan.getContext('agentName'),
                    envVars,
                    valuesFile, // --values
                    setValue, // --set-value
                    setFile, // --set-file
                    dryRun,
                    bypassDownload,
                });
            },
            installationEvent: installationProgress.events.AGENT_INSTALLED,
            executeOnDryRun: true,
            condition: !shouldUseHelm,
        });

        // generate new runtime name
        installationPlan.addContext('runtimeName', runtimeName ? runtimeName.trim() : runtimeName);
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
                const reName = installationPlan.getContext('runtimeName');
                const runtimeCreateOpt = {
                    namespace: kubeNamespace,
                    storageClassName: storageClassName || `${INSTALLATION_DEFAULTS.STORAGE_CLASS_PREFIX}-${kubeNamespace}`,
                    serviceAccount: INSTALLATION_DEFAULTS.RUNTIME_SERVICE_ACCOUNT,
                    clusterName: kubeContextName,
                    runtimeEnvironmentName: reName,
                    agent: true,
                    dockerDaemonScheduler: {
                        userAccess: dockerDaemonAccess,
                    },
                };

                if (buildNodeSelector) {
                    runtimeCreateOpt.nodeSelector = keyValueAsStringToObject(buildNodeSelector);
                }

                await sdk.cluster.create(runtimeCreateOpt);
                console.log(`Runtime environment "${colors.cyan(reName)}" has been created`);
            },
        });

        // update runtime images with docker-registry
        installationPlan.addStep({
            name: 'update runtime environment images with docker-registry url',
            func: async () => {
                const reName = installationPlan.getContext('runtimeName');
                const re = await sdk.runtimeEnvs.get({ name: reName });
                const body = _.set({}, 'runtimeScheduler.envVars', getRuntimeImagesWithRegistryUrl(dockerRegistry));
                _.set(body, 'runtimeScheduler.image', `${dockerRegistry}/codefresh/engine:master`);
                _.set(body, 'dockerDaemonScheduler.dindImage', `${dockerRegistry}/codefresh/dind:18.09.5-v24-sp`);
                await sdk.runtimeEnvs.update({ name: reName }, _.merge(re, body));
                console.log(`Runtime environment "${colors.cyan(reName)}" has been updated with the specified docker-registry images`);
            },
            condition: !!dockerRegistry && dockerRegistry !== defaultDockerRegistry,
        });

        // update env vars
        installationPlan.addStep({
            name: 'update runtime environment with env vars and resources',
            func: async () => {
                const reName = installationPlan.getContext('runtimeName');
                const re = await sdk.runtimeEnvs.get({ name: reName });

                // update re env vars
                if (envVars.length || reEnvVars) {
                    const envVarsObj = _.merge(keyValueArrayToObject(envVars), reEnvVars);

                    const currentEngineEnvVars = _.get(re, 'runtimeScheduler.envVars', {});
                    const currentDindEnvVars = _.get(re, 'dockerDaemonScheduler.envVars', {});
                    const newEngineEnvVars = _.merge(currentEngineEnvVars, envVarsObj);
                    const newDindEnvVars = _.merge(currentDindEnvVars, envVarsObj);

                    _.set(re, 'runtimeScheduler.envVars', newEngineEnvVars);
                    _.set(re, 'dockerDaemonScheduler.envVars', newDindEnvVars);
                }

                // update dind resources
                if (reResources) {
                    _.set(re, 'dockerDaemonScheduler.defaultDindResources', reResources);
                }

                if (reTolerations) {
                    _.set(re, 'runtimeScheduler.tolerations', reTolerations);
                    _.set(re, 'dockerDaemonScheduler.tolerations', reTolerations);
                }

                if (userVolumeMounts) {
                    const currentdockerDaemonScheduler = _.get(re, 'dockerDaemonScheduler', {});
                    const newDockerDaemonScheduler = _.merge(currentdockerDaemonScheduler, { userVolumeMounts });
                    _.set(re, 'dockerDaemonScheduler', newDockerDaemonScheduler);
                }

                if (userVolumes) {
                    const currentdockerDaemonScheduler = _.get(re, 'dockerDaemonScheduler', {});
                    const newDockerDaemonScheduler = _.merge(currentdockerDaemonScheduler, { userVolumes });
                    _.set(re, 'dockerDaemonScheduler', newDockerDaemonScheduler);
                }

                await sdk.runtimeEnvs.update({ name: reName }, re);
                console.log(`Runtime environment "${colors.cyan(reName)}" has been updated with env vars`);
            },
            condition: envVars.length || reResources || userVolumeMounts || userVolumes || reEnvVars,
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
            installationEvent: installationProgress.events.CLUSTER_INTEGRATION_ADDED,
            condition: async () => {
                if (skipClusterIntegration) {
                    return false;
                }
                if (isInCluster()) {
                    console.log('Cluster integration was not added , please add it via codefresh "create clusters [name]"');
                    return false;
                }
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
                    dockerRegistry,
                    envVars,
                    valuesFile,
                    setValue,
                    setFile,
                    storageClassName,
                    dryRun,
                    bypassDownload,
                });
            },
            installationEvent: installationProgress.events.RUNTIME_INSTALLED,
            executeOnDryRun: true,
            condition: !shouldUseHelm,
        });

        installationPlan.addStep({
            name: 'install app-proxy',
            func: async () => {
                await installAppProxy({
                    apiHost: sdk.config.context.url,
                    kubeContextName,
                    kubeNamespace,
                    verbose,
                    kubeConfigPath,
                    dockerRegistry,
                    envVars,
                    valuesFile,
                    setValue,
                    setFile,
                    bypassDownload,
                    appProxyHost,
                    appProxyIngressClass,
                    dryRun,
                });
                const appProxyUrl = `https://${appProxyHost}${appProxyPathPrefix || ''}`;
                installationPlan.addContext('appProxyIP', `${appProxyUrl}`);
            },
            installationEvent: installationProgress.events.APP_PROXY_INSTALLED,
            condition: !!appProxy && !shouldUseHelm,
            executeOnDryRun: true,
        });

        // update runtime with ingress IP
        installationPlan.addStep({
            name: 'update runtime environment app proxy ip',
            func: async () => {
                const reName = installationPlan.getContext('runtimeName');
                const re = await sdk.runtimeEnvs.get({ name: reName });
                const body = {
                    appProxy: {
                        externalIP: installationPlan.getContext('appProxyIP'),
                    },
                };
                await sdk.runtimeEnvs.update({ name: reName }, _.merge(re, body));
                console.log(`Runtime environment "${colors.cyan(reName)}" has been updated with the app proxy`);
            },
            condition: async () => {
                if (shouldUseHelm) {
                    return false;
                }

                return installationPlan.getContext('appProxyIP');
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
            installationEvent: installationProgress.events.AGENT_UPDATED,
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
                    dryRun,
                    bypassDownload,
                    valuesFile,
                    setValue,
                    setFile,
                });
            },
            installationEvent: installationProgress.events.RUNNER_INSTALLED,
            executeOnDryRun: true,
            condition: !shouldUseHelm,
        });


        function shouldInstallMonitoringFn() {
            if (!installMonitor) {
                return false;
            }

            if (isInCluster() || skipClusterIntegration) {
                console.log('Monitor component cannot be installed without cluster integration, you can install it seperately using: "codefresh install monitor"');
                return false;
            }

            return true;
        }

        // install monitoring
        installationPlan.addStep({
            name: 'install cluster monitoring',
            func: installMonitoring.handler,
            arg: {
                'kube-config-path': kubeConfigPath,
                'cluster-id': kubeContextName,
                'kube-context-name': kubeContextName,
                'kube-namespace': kubeNamespace,
                'docker-registry': dockerRegistry,
                'env-vars': envVars,
                'set-value': setValue,
                'set-file': setFile,
                'dry-run': dryRun,
                'bypass-download': bypassDownload,
                token: _.get(sdk, 'config.context.token'),
                verbose,
                noExit: true, // to prevent if from calling inner: process.exit()
                url,
                values: valuesFile,
            },
            successMessage: 'Successfully installed cluster monitoring',
            installationEvent: installationProgress.events.MONITOR_INSTALLED,
            executeOnDryRun: true,
            condition: !shouldUseHelm && shouldInstallMonitoringFn,
        });

        // helm value files if its enabled
        installationPlan.addStep({
            name: 'generate helm value files',
            func: async () => {
                const runtimeNameContext = installationPlan.getContext('runtimeName');
                const agent = installationPlan.getContext('agent');

                const keys = await produceVenonaKeys(
                    _.get(sdk, 'config.context.token'),
                    kubeNamespace,
                );

                const _appProxy = {
                    enabled: appProxy || false,
                    host: appProxyHost || '',
                };

                const monitor = {
                    enabled: shouldInstallMonitoringFn(),
                    clusterId: kubeContextName,
                };

                const global = {
                    namespace: kubeNamespace,
                    codefreshHost: sdk.config.context.url,
                    agentToken: agent.token,
                    agentId: agent.id,
                    agentName: agent.name,
                    accountId: agent.account,
                    runtimeName: runtimeNameContext,
                    keys,
                };

                const content = JSON.stringify({ appProxy: _appProxy, monitor, global }, null, 4);

                fs.writeFileSync(
                    helmValuesFile,
                    content,
                    {
                        encoding: 'utf8',
                    },
                );
            },
            condition: shouldUseHelm,
        });

        // Post Installation
        if (shouldExecutePipeline) {
            await addPipelineToInstallationPlan(installationPlan, dockerRegistry, !shouldUseHelm);
        }

        await installationPlan.execute();

        if (!shouldUseHelm) {
            console.log(colors.green('\nRunner Status:'));
            await getAgents.handler({});
            console.log('');
        }

        if (installMonitor) {
            console.log(`Go to ${colors.blue('https://g.codefresh.io/kubernetes/services/')} to view your cluster in Codefresh dashbaord`);
        }

        console.log(`Link to the new runtime: ${colors.blue(`https://g.codefresh.io/account-admin/account-conf/runtime-environments?runtime=${encodeURI(installationPlan.getContext('runtimeName'))}`)}`);
        console.log(`\nDocumentation link: ${colors.blue('https://codefresh.io/docs/docs/enterprise/codefresh-runner/#codefresh-runner-preview-release')}`);
        console.log(`If you had any issues with the installation please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`);
        await to(progressReporter.report(installationProgress.events.FINISHED, installationProgress.status.SUCCESS));
        await drawCodefreshFiglet();

        if (shouldUseHelm) {
            console.log('\n\nTo install helm run:');
            console.log('helm repo add cf-runtime https://h.cfcr.io/codefresh-inc/runtime');
            console.log(`kubectl create ns ${kubeNamespace}`);
            console.log(`helm install cf-runtime cf-runtime/cf-runtime -f ${helmValuesFile} --namespace ${kubeNamespace}\n`);
            console.log('In order to test your runner helm based installation please execute\n' +
                'codefresh runner execute-test-pipeline');
        }

        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = initCmd;
