const { prettyError } = require('../../../../logic/cli-config/errors/helpers');
const colors = require('colors');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const { PIPELINE_CREATED, PIPELINE_EXECUTED } = require('./installation-process').events;
const { status: STATUSES } = require('./installation-process');
const pipelinesRunCmd = require('../pipeline/run.cmd');
const { getAllNamespaces } = require('../../helpers/kubernetes');
const { followLogs } = require('../../helpers/logs');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');

const INSTALLATION_DEFAULTS = {
    NAMESPACE: 'codefresh',
    MAKE_DEFAULT_RE: false,
    RUN_DEMO_PIPELINE: true,
    DEMO_PIPELINE_NAME: 'Codefresh-Runner Demo',
    CF_CONTEXT_NAME: 'cf-runner',
};

const defaultOpenIssueMessage = 'If you had any issues with this process please report them at: ' +
    `${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const url = _.get(sdk, 'config.context.url', 'https://g.codefresh.io');

async function createTestPipeline(runtimeName, pipelineName, pipelineCommands, progressReporter) {
    console.log(`Creating test pipeline with the name: "${colors.cyan(pipelineName)}"`);
    const pipeline = await sdk.pipelines.create({ metadata: { name: pipelineName } });

    pipeline.spec.runtimeEnvironment = {
        name: runtimeName,
    };
    pipeline.spec.steps = {};
    pipeline.spec.stages = ['test'];
    pipeline.spec.steps.test = {
        stage: 'test',
        title: 'test',
        image: 'alpine:latest',
        commands: pipelineCommands || ['echo hello codefresh runner!'],
    };

    await sdk.pipelines.replace(
        { name: pipelineName },
        {
            kind: pipeline.kind,
            spec: pipeline.spec,
            metadata: pipeline.metadata,
            version: pipeline.version,
        },
    );

    if (progressReporter) {
        await to(progressReporter.report(PIPELINE_CREATED, STATUSES.SUCCESS));
    }

    const pipelineLink = `${url}/pipelines/edit/workflow?id=${pipeline.metadata.id}&pipeline=${encodeURI(pipeline.metadata.name)}`;
    console.log(`Created test pipeline with the name "${colors.cyan(pipelineName)}". Watch it here: ${colors.blue(pipelineLink)}`);

    return pipeline;
}

async function getTestPipelineLink(pipelineName) {
    const pipelines = await sdk.pipelines.list({ id: pipelineName });
    if (_.get(pipelines, 'docs.length')) {
        const pipeline = pipelines.docs[0];
        return `${url}/pipelines/edit/workflow?id=${pipeline.metadata.id}&pipeline=${encodeURI(pipeline.metadata.name)}`;
    }
}

async function getTestPipeline(pipelineName) {
    const pipelines = await sdk.pipelines.list({ id: pipelineName });
    if (_.get(pipelines, 'docs.length')) {
        const pipeline = pipelines.docs[0];
        const pipelineLink = `${url}/pipelines/edit/workflow?id=${pipeline.metadata.id}&pipeline=${encodeURI(pipeline.metadata.name)}`;
        console.log(`Test pipeline with the name: "${colors.cyan(pipelineName)}" already exists.` +
            ` Watch it here: ${colors.blue(pipelineLink)}`);
        return pipeline;
    }


    return null;
}

async function executeTestPipeline(runtimeName, pipeline, progressReporter) {
    const pipelineName = _.get(pipeline, 'metadata.name');

    const workflowId = await pipelinesRunCmd.handler({
        name: pipelineName,
        exitProcess: false,
        annotation: [],
        'runtime-name': runtimeName,
        returnWorkflowId: true,
    });
    const buildLink = `${url}/build/${workflowId}`;
    console.log(`Executing pipeline "${colors.cyan(pipelineName)}", watch it at: ${colors.blue(buildLink)}`);
    await followLogs(workflowId);
    if (progressReporter) {
        await to(progressReporter.report(PIPELINE_EXECUTED, STATUSES.SUCCESS));
    }
}

function createErrorHandler(openIssueMessage = defaultOpenIssueMessage) {
    return async (error, message, progressReporter, event) => {
        if (!error) {
            return;
        }

        if (progressReporter) {
            await to(progressReporter.report(event, STATUSES.FAILURE));
        }

        console.log(`${colors.red('Error:')} ${message}: ${prettyError(error)}`);
        console.log(colors.green(openIssueMessage));
        process.exit(1);
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

module.exports = {
    getRelatedAgents,
    createErrorHandler,
    getRelatedNamespaces,
    getRuntimesWithVersions,
    getRuntimeVersion,
    createTestPipeline,
    getTestPipeline,
    executeTestPipeline,
    createProgressBar,
    getTestPipelineLink,
    INSTALLATION_DEFAULTS,
};
