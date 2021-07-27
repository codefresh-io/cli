const { prettyError } = require('../../../../logic/cli-config/errors/helpers');
const colors = require('colors');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const { status: STATUSES } = require('./installation-process');
const pipelinesRunCmd = require('../pipeline/run.cmd');
const { getAllNamespaces } = require('../../helpers/kubernetes');
const { followLogs } = require('../../helpers/logs');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');
const figlet = require('figlet');
const path = require('path');
const { homedir } = require('os');
const {
    components, Runner, Downloader, CommonProgressFormat,
    CODEFRESH_PATH,
} = require('./../../../../binary');
const { pathExists } = require('../../helpers/general');
const Promise = require('bluebird');
const YAML = require('yaml');
const fs = require('fs');

const INSTALLATION_DEFAULTS = {
    NAMESPACE: 'codefresh',
    MAKE_DEFAULT_RE: false,
    RUN_DEMO_PIPELINE: true,
    DEMO_PIPELINE_NAME: 'CF_Runner_Demo',
    PROJECT_NAME: 'Runner',
    CF_CONTEXT_NAME: 'cf-runner',
    STORAGE_CLASS_PREFIX: 'dind-local-volumes-runner',
    RUNTIME_SERVICE_ACCOUNT: 'codefresh-engine',
    RESUME_OLD_INSTALLATION: true,
    COMPONENTS_FOLDER: 'components',
    KUBECONFIG_PATH: path.join(homedir(), '.kube', 'config'),
    SAAS_RUNTIME: 'SAAS runtime',
    HELM_FILE_PATH: path.join(process.cwd(), 'generated_values.yaml'),
};

const RUNTIME_IMAGES = {
    DOCKER_PUSHER_IMAGE: 'codefresh/cf-docker-pusher:6.0.3',
    DOCKER_PULLER_IMAGE: 'codefresh/cf-docker-puller:8.0.2',
    DOCKER_TAG_PUSHER_IMAGE: 'codefresh/cf-docker-tag-pusher:v2',
    DOCKER_BUILDER_IMAGE: 'codefresh/cf-docker-builder:1.1.12',
    GC_BUILDER_IMAGE: 'codefresh/cf-gc-builder:0.4.0',
    CONTAINER_LOGGER_IMAGE: 'codefresh/cf-container-logger:1.4.5',
    GIT_CLONE_IMAGE: 'codefresh/cf-git-cloner:10.0.3',
    COMPOSE_IMAGE: 'docker/compose:1.11.2',
    KUBE_DEPLOY: 'codefresh/cf-deploy-kubernetes:latest',
    FS_OPS_IMAGE: 'codefresh/fs-ops:latest',
    TEMPLATE_ENGINE: 'codefresh/pikolo:latest',
    PIPELINE_DEBUGGER_IMAGE: 'codefresh/cf-debugger:1.1.2',
};

const DEMO_STEP_IMAGE = {
    'docker.io': 'alpine:latest',
    'quay.io': 'quay.io/codefresh/alpine:3.11',
    'gcr.io': 'gcr.io/google-containers/alpine-with-bash',
    default: 'quay.io/codefresh/alpine:3.11',
};

const maxRuntimeNameLength = 63;
const DefaultLogFormatter = 'plain';

const defaultOpenIssueMessage = 'If you had any issues with this process please report them at: ' +
    `${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;

async function _createRunnerProjectIfNotExists() {
    const [err, projectExists] = await to(sdk.projects.getByName({ name: INSTALLATION_DEFAULTS.PROJECT_NAME }));
    if (_.get(err, 'message', '').includes('not found') || !projectExists) {
        await sdk.projects.create({ projectName: INSTALLATION_DEFAULTS.PROJECT_NAME });
        console.log(`Project "${colors.cyan(INSTALLATION_DEFAULTS.PROJECT_NAME)}" was created`);
    } else {
        console.log(`Project "${colors.cyan(INSTALLATION_DEFAULTS.PROJECT_NAME)}" already exists`);
    }
}

async function getTestPipelineLink(pipelineName, pipeline) {
    const url = _.get(sdk, 'config.context.url', 'https://g.codefresh.io');
    let _pipeline = pipeline;
    if (!_pipeline) {
        const pipelines = await sdk.pipelines.list({ id: `${INSTALLATION_DEFAULTS.PROJECT_NAME}/${pipelineName}` });
        if (_.get(pipelines, 'docs.length')) {
            [_pipeline] = pipelines.docs;
        }
    }

    if (_pipeline) {
        const cleanPipelineName = _pipeline.metadata.name.replace(`${INSTALLATION_DEFAULTS.PROJECT_NAME}/`, ''); // remove the project prefix
        return `${url}/pipelines/edit/workflow?id=${_pipeline.metadata.id}&pipeline=${encodeURI(cleanPipelineName)}` +
            `&projects=${encodeURI(INSTALLATION_DEFAULTS.PROJECT_NAME)}`;
    }

    return '';
}

async function createTestPipeline(runtimeName, pipelineName, pipelineCommands, dockerRegistry) {
    await _createRunnerProjectIfNotExists();
    console.log(`Creating test pipeline with the name: "${colors.cyan(pipelineName)}" ` +
        `in project "${colors.cyan(INSTALLATION_DEFAULTS.PROJECT_NAME)}"`);
    const pipeline = await sdk.pipelines.create({ metadata: { name: `${INSTALLATION_DEFAULTS.PROJECT_NAME}/${pipelineName}` } });

    pipeline.spec.runtimeEnvironment = {
        name: runtimeName,
    };

    const demoStepImage = DEMO_STEP_IMAGE[dockerRegistry] || DEMO_STEP_IMAGE.default;

    pipeline.spec.steps = {};
    pipeline.spec.stages = ['test'];
    pipeline.spec.steps.test = {
        stage: 'test',
        title: 'test',
        image: demoStepImage,
        commands: pipelineCommands || ['echo hello Codefresh Runner!'],
    };

    await sdk.pipelines.replace(
        { name: `${INSTALLATION_DEFAULTS.PROJECT_NAME}/${pipelineName}` },
        {
            kind: pipeline.kind,
            spec: pipeline.spec,
            metadata: pipeline.metadata,
            version: pipeline.version,
        },
    );

    const pipelineLink = await getTestPipelineLink(undefined, pipeline);
    console.log(`Created test pipeline with the name "${colors.cyan(pipelineName)}". Watch it here: ${colors.blue(pipelineLink)}`);

    return pipeline;
}

async function getTestPipeline(pipelineName) {
    const pipelines = await sdk.pipelines.list({ id: `${INSTALLATION_DEFAULTS.PROJECT_NAME}/${pipelineName}` });
    if (_.get(pipelines, 'docs.length')) {
        const pipeline = pipelines.docs[0];
        const pipelineLink = await getTestPipelineLink(undefined, pipeline);
        console.log(`Test pipeline with the name: "${colors.cyan(pipelineName)}" already exists.` +
            ` Watch it here: ${colors.blue(pipelineLink)}`);
        return pipeline;
    }

    return null;
}

async function updateTestPipelineRuntime(pipeline, runtimeName, pipelineName, dockerRegistry) {
    let _pipeline = pipeline;
    if (!_pipeline) {
        const testPipeline = await getTestPipeline(pipelineName);
        if (!testPipeline) {
            throw new Error('Could not get test pipeline');
        }
        _pipeline = testPipeline;
    }
    _pipeline.spec.runtimeEnvironment = {
        name: runtimeName,
    };

    const demoStepImage = DEMO_STEP_IMAGE[dockerRegistry] || DEMO_STEP_IMAGE.default;

    _pipeline.spec.steps.test.image = demoStepImage;

    await sdk.pipelines.replace(
        { name: _pipeline.metadata.name },
        {
            kind: _pipeline.kind,
            spec: _pipeline.spec,
            metadata: _pipeline.metadata,
            version: _pipeline.version,
        },
    );
}

async function executeTestPipeline(runtimeName, pipelineName) {
    const url = _.get(sdk, 'config.context.url', 'https://g.codefresh.io');
    const projectPrefix = `${INSTALLATION_DEFAULTS.PROJECT_NAME}/`;
    console.log(`${colors.yellow('*NOTE* Running a pipeline for the first time might take longer than usual.')}`);
    let _pipelineName = pipelineName;
    if (!pipelineName.includes(projectPrefix)) {
        _pipelineName = `${projectPrefix}${pipelineName}`;
    }
    const workflowId = await pipelinesRunCmd.handler({
        name: _pipelineName,
        exitProcess: false,
        annotation: [],
        'runtime-name': runtimeName,
        returnWorkflowId: true,
    });
    const buildLink = `${url}/build/${workflowId}`;
    console.log(`Executing pipeline "${colors.cyan(pipelineName)}", watch it at: ${colors.blue(buildLink)}`);
    await followLogs(workflowId);
}

function createErrorHandler(openIssueMessage = defaultOpenIssueMessage) {
    return async (error, message, progressReporter, event, exitOnError = true) => {
        if (!error) {
            return;
        }

        if (progressReporter && event) {
            await to(progressReporter.report(event, STATUSES.FAILURE));
        }

        console.log(`${colors.red('Error:')} ${message}: ${prettyError(error)}`);
        if (exitOnError) {
            console.log(colors.green(openIssueMessage));
            process.exit(1);
        }
    };
}

async function getRelatedAgents(kubeNamespace, runtimes, agents, errHandler) {
    let allAgents = agents;
    if (!agents) {
        const [listAgentsErr, _agents] = await to(sdk.agents.list({}));
        await errHandler(listAgentsErr, 'Failed to get agents');
        allAgents = _agents;
    }

    const relatedREs = new Set();
    _.forEach(runtimes, (r) => {
        if (_.get(r, 'runtimeScheduler.cluster.namespace') === kubeNamespace) {
            relatedREs.add(r.metadata.name);
        }
    });

    const relatedAgents = [];
    _.forEach(allAgents, (a) => {
        _.forEach(_.get(a, 'runtimes', []), (r) => {
            if (relatedREs.has(r)) {
                relatedAgents.push(a);
            }
        });
    });

    return relatedAgents;
}

// Try to get the most relevant namespaces
async function getRelatedNamespaces(kubeConfigPath, kubeContextName, runtimes) {
    const [err, namespacesOnCluster] = await to(getAllNamespaces(kubeConfigPath, kubeContextName));
    if (err) {
        throw err;
    }

    const nsOnCluster = new Set(namespacesOnCluster || []);
    return _(runtimes)
        .filter(re => nsOnCluster.has(_.get(re, 'runtimeScheduler.cluster.namespace')))
        .map(re => _.get(re, 'runtimeScheduler.cluster.namespace'))
        .uniq()
        .value();
}

function getRuntimesWithVersions(runtimes, agents) {
    const hybridRuntimes = runtimes.filter(re => _.get(re, 'metadata.agent'));
    const runtimesWithOldVersion = new Set(_.map(hybridRuntimes, re => re.metadata.name));
    const runtimesWithNewVersion = new Set();
    _.forEach(agents, (a) => {
        _.forEach(a.runtimes, (re) => {
            runtimesWithOldVersion.delete(re);
            runtimesWithNewVersion.add(re);
        });
    });

    const runtimesWithVersions = [...runtimesWithOldVersion, ...runtimesWithNewVersion].reduce((acc, cur, i) => {
        acc[cur] = i < runtimesWithOldVersion.size ? '0.x.x' : '1.x.x';
        return acc;
    }, {});

    return runtimesWithVersions;
}

function getRuntimeVersion(runtimeName, agents) {
    let hasAgentsAttached = false;
    _.forEach(agents, (a) => {
        _.forEach(a.runtimes, (re) => {
            if (re === runtimeName) {
                hasAgentsAttached = true;
            }
        });
    });

    return hasAgentsAttached ? '1.0.0' : '0.0.1';
}

function createProgressBar() {
    const runtimeEvents = new ProgressEvents();
    const runtimeFormat = 'downloading runtime installer [{bar}] {percentage}% | {value}/{total}';
    const runtimmrProgressBar = new cliProgress.SingleBar(
        { stopOnComplete: true, format: runtimeFormat },
        cliProgress.Presets.shades_classic,
    );
    let runtimeTotalSize;
    runtimeEvents.onStart((size) => {
        console.log('Downloading runtime installer:\n');
        runtimmrProgressBar.start(size, 0);
        runtimeTotalSize = size;
    });
    runtimeEvents.onProgress((progress) => {
        runtimmrProgressBar.update(progress);
        if (progress >= runtimeTotalSize) {
            console.log('\n');
        }
    });

    return runtimeEvents;
}

function drawCodefreshFiglet() {
    return Promise.race([new Promise((resolve) => {
        figlet('CODEFRESH', (err, data) => {
            if (err) {
                resolve();
            }
            if (data) {
                console.log(data);
            }
            resolve();
        });
    }), Promise.delay(5000)]);
}

async function getDefaultRuntime(runtimes) {
    let _runtimes = runtimes;
    if (!_runtimes) {
        _runtimes = await sdk.runtimeEnvs.list({ });
    }
    const defaultRe = _.find(_runtimes, re => re.default);

    return defaultRe;
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

async function getComponent(location = CODEFRESH_PATH, component, bypassDownload) {
    const componentName = component.name || 'component';
    const localBinLocation = path.join(
        process.cwd(),
        INSTALLATION_DEFAULTS.COMPONENTS_FOLDER,
        _.get(component, 'local.dir', ''),
        _.get(component, 'local.bin', ''),
    );

    const downloadedBinLocation = path.join(
        process.cwd(),
        location,
        _.get(component, 'local.dir', ''),
        _.get(component, 'local.bin', ''),
    );

    if (bypassDownload) {
        if (await pathExists(localBinLocation)) {
            return path.join(process.cwd(), INSTALLATION_DEFAULTS.COMPONENTS_FOLDER);
        }
        if (await pathExists(downloadedBinLocation)) {
            return location;
        }

        throw new Error(`cannot bypass download, ${componentName} not found, aborting.`);
    }

    const downloader = new Downloader({
        progress: new cliProgress.SingleBar(
            {
                stopOnComplete: true,
                format: CommonProgressFormat,
            },
            cliProgress.Presets.shades_classic,
        ),
        location,
    });

    const [err] = await to(downloader.download(component));
    if (err) {
        if (await pathExists(localBinLocation)) {
            console.log(`failed to download ${componentName}, using local binary instead`);

            return path.resolve(process.cwd(), INSTALLATION_DEFAULTS.COMPONENTS_FOLDER);
        }

        throw new Error(`failed to download ${componentName}, aborting.`);
    }

    return location;
}

async function downloadVeonona(location, bypassDownload = false) {
    return await getComponent(location, components.venona, bypassDownload);
}

async function downloadProvider({ provider, location }, bypassDownload = false) {
    return await await getComponent(location, components.gitops[provider], bypassDownload);
}

async function downloadSteveDore(location, bypassDownload = false) {
    return await getComponent(location, components.stevedore, bypassDownload);
}

async function downloadHybridComponents(location, bypassDownload = false) {
    await downloadVeonona(location, bypassDownload);
    console.log(`Kubernetes components installer downloaded successfully to ${location} `);
    await downloadSteveDore(location, bypassDownload);
    console.log(`Kubernetes registrator installer downloaded successfully ${location}`);
}

async function runClusterAcceptanceTests({
    apiHost,
    kubeNamespace,
    kubeConfigPath,
    kubeContextName,
    dockerRegistry,
    envVars,
    verbose,
    valuesFile, // --values
    setValue, // --set-value
    setFile, // --set-file
    bypassDownload, // --bypass-download
}) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = ['test', '--log-formtter', DefaultLogFormatter];
    if (apiHost) {
        cmd.push(`--api-host=${apiHost}`);
    }
    if (kubeNamespace) {
        cmd.push('--kube-namespace');
        cmd.push(kubeNamespace);
    }
    if (kubeContextName) {
        cmd.push('--kube-context-name');
        cmd.push(kubeContextName);
    }
    if (kubeConfigPath) {
        cmd.push('--kube-config-path');
        cmd.push(kubeConfigPath);
    }
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
        cmd.push('--insecure');
    }
    if (dockerRegistry) {
        cmd.push(`--set-value=DockerRegistry=${dockerRegistry}`);
    }
    if (verbose) {
        cmd.push(`--verbose=${verbose}`);
    }
    if (envVars) {
        envVars.forEach((item) => {
            const parts = item.split('=');
            cmd.push(`--set-value=EnvVars.${parts[0]}=${parts[1].replace(/,/g, '\\,')}`);
        });
    }
    if (valuesFile) {
        cmd.push(`--values=${valuesFile}`);
    }
    if (setValue) {
        cmd.push(`--set-value=${setValue}`);
    }
    if (setFile) {
        cmd.push(`--set-file=${setFile}`);
    }
    await componentRunner.run(components.venona, cmd);
}

async function runUpgrade({ kubeNamespace, kubeContextName, bypassDownload }) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = ['upgrade', '--log-formtter', DefaultLogFormatter];
    if (kubeNamespace) {
        cmd.push('--kube-namespace');
        cmd.push(kubeNamespace);
    }
    if (kubeContextName) {
        cmd.push('--kube-context-name');
        cmd.push(kubeContextName);
    }
    await componentRunner.run(components.venona, cmd);
}

async function installAgent({
    apiHost, // --api-host
    agentId, // --agnetId
    kubeContextName, // kube-context-name
    kubeNamespace, // --kube-namespace
    dockerRegistry, // --docker-registry
    token, // --agentToken
    kubeNodeSelector, // --kube-node-selector
    dryRun, // --dryRun
    bypassDownload, // --bypass-download
    inCluster, // -inCluster
    tolerations, // --tolerations
    venonaVersion, // --venona-version
    kubeConfigPath, // --kube-config-path
    skipVersionCheck, // --skip-version-check
    verbose, // --verbose
    logFormatting = DefaultLogFormatter, // --log-formtter
    envVars,
    valuesFile, // --values
    setValue, // --set-value
    setFile, // --set-file
}) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = [
        'install',
        'agent',
        '--agentId',
        agentId,
        '--api-host',
        apiHost,
        '--kube-context-name',
        kubeContextName,
        '--kube-namespace',
        kubeNamespace,
        '--log-formtter',
        logFormatting,
    ];
    if (kubeNodeSelector) {
        cmd.push('--kube-node-selector');
        cmd.push(kubeNodeSelector);
    }

    if (dockerRegistry) {
        cmd.push(`--docker-registry=${dockerRegistry}`);
    }

    if (token) {
        cmd.push(`--agentToken=${token}`);
    }
    if (dryRun) {
        cmd.push('--dry-run');
    }

    if (bypassDownload) {
        cmd.push(`--bypass-download=${bypassDownload}`);
    }

    if (inCluster) {
        cmd.push('--in-cluster');
    }
    if (tolerations) {
        cmd.push(`--tolerations=${tolerations}`);
    }
    if (venonaVersion) {
        cmd.push(`--venona-version=${venonaVersion}`);
    }
    if (kubeConfigPath) {
        cmd.push(`--kube-config-path=${kubeConfigPath}`);
    }
    if (skipVersionCheck) {
        cmd.push('--skip-version-check');
    }
    if (verbose) {
        cmd.push('--verbose');
    }
    if (envVars) {
        envVars.forEach((item) => {
            const parts = item.split('=');
            cmd.push(`--set-value=EnvVars.${parts[0]}=${parts[1].replace(/,/g, '\\,')}`);
        });
    }
    if (valuesFile) {
        cmd.push(`--values=${valuesFile}`);
    }
    if (setValue) {
        cmd.push(`--set-value=${setValue}`);
    }
    if (setFile) {
        cmd.push(`--set-file=${setFile}`);
    }
    await componentRunner.run(components.venona, cmd);
}

async function installRuntime({
    apiHost, // --api-host
    token, // --agent-token
    kubeContextName, // kube-context-name
    kubeNamespace, // --kube-namespace
    dockerRegistry, // --docker-registry
    dryRun, // --dryRun
    bypassDownload, // --bypass-download
    inCluster, // -inCluster
    kubeConfigPath, // --kube-config-path
    verbose, // --verbose
    name, // --runtimeEnvironmentName
    envVars,
    valuesFile, // --values
    setValue, // --set-value
    setFile, // --set-file
    kubeNodeSelector, // --kube-node-selector
    storageClassName, // --storage-class
    logFormatting = DefaultLogFormatter, // --log-formtter
}) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = [
        'install',
        'runtime',
        '--codefreshToken',
        token,
        '--api-host',
        apiHost,
        '--kube-context-name',
        kubeContextName,
        '--kube-namespace',
        kubeNamespace,
        '--log-formtter',
        logFormatting,
    ];

    if (dockerRegistry) {
        cmd.push(`--docker-registry=${dockerRegistry}`);
    }

    if (dryRun) {
        cmd.push('--dry-run');
    }
    if (inCluster) {
        cmd.push('--in-cluster');
    }
    if (kubeConfigPath) {
        cmd.push(`--kube-config-path=${kubeConfigPath}`);
    }
    if (verbose) {
        cmd.push('--verbose');
    }
    if (valuesFile) {
        cmd.push(`--values=${valuesFile}`);
    }
    if (setValue) {
        cmd.push(`--set-value=${setValue}`);
    }
    if (envVars) {
        envVars.forEach((item) => {
            const parts = item.split('=');
            cmd.push(`--set-value=EnvVars.${parts[0]}=${parts[1].replace(/,/g, '\\,')}`);
        });
    }
    if (setFile) {
        cmd.push(`--set-file=${setFile}`);
    }
    if (kubeNodeSelector) {
        cmd.push(`--kube-node-selector=${kubeNodeSelector}`);
    }
    if (name) {
        cmd.push('--runtimeName');
        cmd.push(name);
    }
    if (storageClassName) {
        cmd.push(`--storage-class=${storageClassName}`);
    }
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
        cmd.push('--insecure');
    }

    await componentRunner.run(components.venona, cmd);
}

async function installAppProxy({
    kubeContextName, // kube-context-name
    kubeNamespace, // --kube-namespace
    kubeConfigPath, // --kube-config-path
    verbose, // --verbose
    dockerRegistry, // --docker-registry
    logFormatting = DefaultLogFormatter, // --log-formtter
    bypassDownload, // --bypass-download
    valuesFile, // --values
    setValue, // --set-value
    setFile, // --set-file
    appProxyHost, // --app-proxy-host
    appProxyIngressClass, // --app-proxy-ingress-class
    apiHost, // --api-host
    envVars, // --envVars
    dryRun, // --dry-run
}) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = [
        'install',
        'app-proxy',
        '--kube-context-name',
        kubeContextName,
        '--kube-namespace',
        kubeNamespace,
        '--log-formtter',
        logFormatting,
    ];

    if (dockerRegistry) {
        cmd.push(`--docker-registry=${dockerRegistry}`);
    }

    if (apiHost) {
        cmd.push(`--api-host=${apiHost}`);
    }

    if (kubeConfigPath) {
        cmd.push(`--kube-config-path=${kubeConfigPath}`);
    }
    if (verbose) {
        cmd.push('--verbose');
    }
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
        cmd.push('--insecure');
    }
    if (setValue) {
        if (_.isArray(setValue)) {
            setValue.forEach(sv => cmd.push(`--set-value=${sv}`));
        } else {
            cmd.push(`--set-value=${setValue}`);
        }
    }
    if (envVars) {
        envVars.forEach((item) => {
            const parts = item.split('=');
            cmd.push(`--set-value=EnvVars.${parts[0]}=${parts[1].replace(/,/g, '\\,')}`);
        });
    }
    if (valuesFile) {
        cmd.push(`--values=${valuesFile}`);
    }
    if (setFile) {
        cmd.push(`--set-file=${setFile}`);
    }
    if (appProxyHost) {
        cmd.push(`--host=${appProxyHost}`);
    }
    if (dryRun) {
        cmd.push('--dry-run');
    }
    if (appProxyIngressClass) {
        cmd.push(`--ingress-class=${appProxyIngressClass}`);
    }

    await componentRunner.run(components.venona, cmd, true);
}

async function unInstallAppProxy({
    kubeContextName, // kube-context-name
    kubeNamespace, // --kube-namespace
    kubeConfigPath, // --kube-config-path
    verbose, // --verbose
    bypassDownload, // --bypass-download
    logFormatting = DefaultLogFormatter, // --log-formtter
    valuesFile, // --values
    setValue, // --set-value
}) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = [
        'uninstall',
        'app-proxy',
        '--kube-context-name',
        kubeContextName,
        '--kube-namespace',
        kubeNamespace,
        '--log-formtter',
        logFormatting,
    ];

    if (kubeConfigPath) {
        cmd.push(`--kube-config-path=${kubeConfigPath}`);
    }
    if (verbose) {
        cmd.push('--verbose');
    }
    if (setValue) {
        if (_.isArray(setValue)) {
            setValue.forEach(sv => cmd.push(`--set-value=${sv}`));
        } else {
            cmd.push(`--set-value=${setValue}`);
        }
    }
    if (valuesFile) {
        cmd.push(`--values=${valuesFile}`);
    }
    await componentRunner.run(components.venona, cmd);
}

async function upgradeAppProxy({
    kubeContextName, // kube-context-name
    kubeNamespace, // --kube-namespace
    kubeConfigPath, // --kube-config-path
    verbose, // --verbose
    bypassDownload, // --bypass-download
    logFormatting = DefaultLogFormatter, // --log-formtter
    valuesFile, // --values
    setValue, // --set-value
}) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = [
        'upgrade',
        'app-proxy',
        '--kube-context-name',
        kubeContextName,
        '--kube-namespace',
        kubeNamespace,
        '--log-formtter',
        logFormatting,
    ];

    if (kubeConfigPath) {
        cmd.push(`--kube-config-path=${kubeConfigPath}`);
    }
    if (verbose) {
        cmd.push('--verbose');
    }
    if (setValue) {
        if (_.isArray(setValue)) {
            setValue.forEach(sv => cmd.push(`--set-value=${sv}`));
        } else {
            cmd.push(`--set-value=${setValue}`);
        }
    }
    if (valuesFile) {
        cmd.push(`--values=${valuesFile}`);
    }
    await componentRunner.run(components.venona, cmd);
}

async function attachRuntime({
    kubeServiceAccount, // kube-service-account
    kubeContextName, // kube-context-name
    kubeNamespace, // --kube-namespace
    kubeConfigPath, // --kube-config-path
    agentKubeContextName, // --kube-context-name-agent
    agentKubeNamespace, // --kube-namespace-agent
    agentKubeConfigPath, // --kube-config-path-agent
    restartAgent, // --restart-agent
    verbose, // --verbose
    runtimeName, // --runtimeName
    logFormatting = DefaultLogFormatter, // --log-formtter
    valuesFile, // --values
    setValue, // --set-value
    setFile, // --set-file
    dryRun,
    bypassDownload,
}) {
    const binLocation = await downloadVeonona(undefined, bypassDownload);
    const componentRunner = new Runner(binLocation);
    const cmd = [
        'attach',
        '--kube-context-name',
        kubeContextName,
        '--kube-namespace',
        kubeNamespace,
        '--runtime-name',
        runtimeName,
        '--log-formtter',
        logFormatting,
    ];

    if (kubeServiceAccount) {
        cmd.push(`--kube-service-account=${kubeServiceAccount}`);
    }

    if (kubeConfigPath) {
        cmd.push(`--kube-config-path=${kubeConfigPath}`);
    }
    if (agentKubeContextName) {
        cmd.push(`--kube-context-name-agent=${agentKubeContextName}`);
    }
    if (agentKubeNamespace) {
        cmd.push(`--kube-namespace-agent=${agentKubeNamespace}`);
    }
    if (agentKubeConfigPath) {
        cmd.push(`--kube-config-path-agent=${agentKubeConfigPath}`);
    }
    if (verbose) {
        cmd.push('--verbose');
    }
    if (restartAgent) {
        cmd.push('--restart-agent');
    }
    if (logFormatting) {
        cmd.push(`--log-formtter=${logFormatting}`);
    }

    if (valuesFile) {
        cmd.push(`--values=${valuesFile}`);
    }
    if (setValue) {
        if (_.isArray(setValue)) {
            setValue.forEach(sv => cmd.push(`--set-value=${sv}`));
        } else {
            cmd.push(`--set-value=${setValue}`);
        }
    }
    if (setFile) {
        cmd.push(`--set-file=${setFile}`);
    }
    if (dryRun) {
        cmd.push('--dry-run');
    }
    await componentRunner.run(components.venona, cmd);
}

async function newRuntimeName(kubeContextName, kubeNamespace) {
    const defaultName = `${kubeContextName}/${kubeNamespace}`.slice(0, maxRuntimeNameLength);
    const runtimes = await sdk.runtimeEnvs.list({ });
    let name;

    if (!_.isArray(runtimes) || !_.find(runtimes, re => _.get(re, 'metadata.name') === defaultName)) {
        name = defaultName; // use the default name if there are no collisions
    } else {
        const reNames = new Set(_.map(runtimes, re => _.get(re, 'metadata.name'))); // for fast lookup
        let i = 1;
        let suggestName;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            suggestName = `${defaultName.slice(0, maxRuntimeNameLength - 1 - i.toString().length)}_${i}`;
            if (!reNames.has(suggestName)) {
                break;
            }
            i += 1;
        }
        name = suggestName;
    }

    return name;
}

async function newAgentName(kubeContextName, kubeNamespace, agents) {
    const defaultName = `${kubeContextName}_${kubeNamespace}`;
    if (!agents) {
        // eslint-disable-next-line no-param-reassign
        agents = await sdk.agents.list({ });
    }
    let name;

    if (!_.isArray(agents) || !_.find(agents, a => a.name === defaultName)) {
        name = defaultName; // use the default name if there are no collisions
    } else {
        const agentsNames = new Set(_.map(agents, a => a.name)); // for fast lookup
        let i = 1;
        while (agentsNames.has(`${defaultName}_${i}`)) {
            i += 1;
        }
        name = `${defaultName}_${i}`;
    }

    return name;
}

function keyValueAsStringToObject(nodeSelectorStr) {
    if (_.isString(nodeSelectorStr)) {
        const kubeNodeSelectorObj = {};
        const nsSplitParts = nodeSelectorStr.split(',');
        nsSplitParts.forEach((nsPart) => {
            const nsRecordSplit = nsPart.split('=');
            if (nsRecordSplit.length !== 2) {
                throw new Error('invalid kube-node-selector parameter');
            }
            // eslint-disable-next-line prefer-destructuring
            kubeNodeSelectorObj[nsRecordSplit[0]] = nsRecordSplit[1];
        });
        return kubeNodeSelectorObj;
    }
    return nodeSelectorStr;
}

function objectToKeyValueArray(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        acc.push(`${key}=${obj[key]}`);
        return acc;
    }, []);
}

function serealizeToKeyValuePairs(obj) {
    return _.keys(obj).reduce((acc, key) => {
        if (acc) {
            return `${acc},${key}=${obj[key]}`;
        }
        return `${key}=${obj[key]}`;
    }, '');
}

function getRuntimeImagesWithRegistryUrl(registry) {
    return Object.keys(RUNTIME_IMAGES).reduce((acc, cur) => {
        acc[cur] = `${registry}/${RUNTIME_IMAGES[cur]}`;
        return acc;
    }, {});
}

function mergeValuesFromValuesFile(argv, valuesFile, handleError) {
    const valuesFileStr = fs.readFileSync(valuesFile, 'utf8');
    const valuesObj = YAML.parse(valuesFileStr);
    const _argv = _.cloneDeep(argv);

    _argv.yes = true; // don't ask any questions

    if (!_.has(_argv, 'kube-config-path') && _.has(valuesObj, 'ConfigPath')) {
        _.set(_argv, 'kube-config-path', valuesObj.ConfigPath);
    }
    if (!_.has(_argv, 'kube-context-name') && _.has(valuesObj, 'Context')) {
        _.set(_argv, 'kube-context-name', valuesObj.Context);
    }
    if (!_.has(_argv, 'kube-namespace') && _.has(valuesObj, 'Namespace')) {
        _.set(_argv, 'kube-namespace', valuesObj.Namespace);
    }
    if (!_.has(_argv, 'url') && _.has(valuesObj, 'CodefreshHost')) {
        _.set(_argv, 'url', valuesObj.CodefreshHost);
    }
    if (!_.has(_argv, 'token') && _.has(valuesObj, 'Token')) {
        _.set(_argv, 'token', valuesObj.Token);
    }
    if (!_.has(_argv, 'name') && _.has(valuesObj, 'AgentId')) {
        _.set(_argv, 'name', valuesObj.AgentId);
    }
    if (!_.has(_argv, 'install-monitor') && _.has(valuesObj, 'Monitor.Enabled')) {
        _.set(_argv, 'install-monitor', valuesObj.Monitor.Enabled);
    }
    if (_.get(valuesObj, 'AppProxy')) {
        _.set(_argv, 'app-proxy', true);
    }
    if (!_.has(_argv, 'app-proxy-host') && _.get(valuesObj, 'AppProxy.Ingress.Host')) {
        _.set(_argv, 'app-proxy-host', valuesObj.AppProxy.Ingress.Host);
    }
    if (_argv.appProxy && !_argv['app-proxy-host']) {
        handleError(new Error('no hostname provided'), 'cannot install app-proxy component without a hostname', undefined, undefined, true);
    }
    if (!_.has(_argv, 'app-proxy-path-prefix') && _.get(valuesObj, 'AppProxy.Ingress.PathPrefix')) {
        _.set(_argv, 'app-proxy-path-prefix', valuesObj.AppProxy.Ingress.PathPrefix);
    }
    if (!_.has(_argv, 'docker-daemon-access') && _.has(valuesObj, 'dockerDaemonScheduler.userAccess')) {
        _.set(_argv, 'docker-daemon-access', valuesObj.dockerDaemonScheduler.userAccess);
    }
    if (_.get(_argv, 'envVars.length') === 0 && _.has(valuesObj, 'EnvVars')) {
        _argv.envVars.push(...objectToKeyValueArray(_.get(valuesObj, 'EnvVars')));
    }
    if (!_.has(_argv, 'docker-registry') && _.has(valuesObj, 'DockerRegistry')) {
        _.set(_argv, 'docker-registry', valuesObj.DockerRegistry);
    }
    if (!_.has(_argv, 'skip-cluster-test') && _.has(valuesObj, 'SkipClusterTest')) {
        _.set(_argv, 'skip-cluster-test', valuesObj.SkipClusterTest);
    }
    if (_.has(valuesObj, 'RuntimeEnvironmentName')) {
        _.set(_argv, 'runtimeName', valuesObj.RuntimeEnvironmentName);
    }
    if (_.has(valuesObj, 'Runtime.AdditionalEnvVars')) {
        _.set(_argv, 'reEnvVars', valuesObj.Runtime.AdditionalEnvVars);
    }
    if (_.has(valuesObj, 'Runtime.NodeSelector')) {
        _.set(_argv, 'build-node-selector', valuesObj.Runtime.NodeSelector);
    }
    if (_.has(valuesObj, 'Runtime.resources')) {
        _.set(_argv, 'reResources', valuesObj.Runtime.resources);
    }
    if (_.has(valuesObj, 'Runtime.tolerations')) {
        _.set(_argv, 'reTolerations', valuesObj.Runtime.tolerations);
    }
    if (_.has(valuesObj, 'Runtime.userVolumeMounts')) {
        _.set(_argv, 'userVolumeMounts', valuesObj.Runtime.userVolumeMounts);
    }
    if (_.has(valuesObj, 'Runtime.userVolumes')) {
        _.set(_argv, 'userVolumes', valuesObj.Runtime.userVolumes);
    }
    if (!_.has(_argv, 'storage-class-name') && _.has(valuesObj, 'StorageClass')) {
        _.set(_argv, 'storage-class-name', valuesObj.StorageClass);
    }
    if (!_.has(_argv, 'skip-cluster-integration') && _.has(valuesObj, 'SkipClusterIntegration')) {
        _.set(_argv, 'skip-cluster-integration', valuesObj.SkipClusterIntegration);
    }

    return _argv;
}

module.exports = {
    getRelatedAgents,
    createErrorHandler,
    getRelatedNamespaces,
    getRuntimesWithVersions,
    getRuntimeVersion,
    createTestPipeline,
    getTestPipeline,
    updateTestPipelineRuntime,
    executeTestPipeline,
    createProgressBar,
    getTestPipelineLink,
    drawCodefreshFiglet,
    getDefaultRuntime,
    getRecommendedKubeNamespace,
    runClusterAcceptanceTests,
    installAgent,
    installRuntime,
    attachRuntime,
    newRuntimeName,
    newAgentName,
    keyValueAsStringToObject,
    objectToKeyValueArray,
    downloadRelatedComponents: downloadHybridComponents,
    downloadSteveDore,
    downloadVeonona,
    downloadProvider,
    runUpgrade,
    serealizeToKeyValuePairs,
    getRuntimeImagesWithRegistryUrl,
    installAppProxy,
    unInstallAppProxy,
    upgradeAppProxy,
    mergeValuesFromValuesFile,
    INSTALLATION_DEFAULTS,
    DefaultLogFormatter,
};
