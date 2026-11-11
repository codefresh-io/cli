const _ = require('lodash');
const colors = require('colors');
const cliProgress = require('cli-progress');
const path = require('path');

const { prettyError } = require('../../../../logic/cli-config/errors/helpers');
const { to } = require('../../../../logic/cli-config/errors/awaitTo');
const sdk = require('../../../../logic/sdk');
const { status: STATUSES } = require('./installation-process');
const pipelinesRunCmd = require('../pipeline/run.cmd');
const { followLogs } = require('../../helpers/logs');
const {
    components, Downloader, CommonProgressFormat,
    CODEFRESH_PATH,
} = require('../../../../binary');
const { pathExists } = require('../../helpers/general');

const INSTALLATION_DEFAULTS = {
    DEMO_PIPELINE_NAME: 'CF_Runner_Demo',
    PROJECT_NAME: 'Runner',
    RUNTIME_SERVICE_ACCOUNT: 'codefresh-engine',
    COMPONENTS_FOLDER: 'components',
};

const DefaultLogFormatter = 'plain';

const DEMO_STEP_IMAGE = {
    'docker.io': 'alpine:latest',
    'quay.io': 'quay.io/codefresh/alpine:3.11',
    'gcr.io': 'gcr.io/google-containers/alpine-with-bash',
    default: 'quay.io/codefresh/alpine:3.11',
};

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

async function getComponent(location = CODEFRESH_PATH, component, bypassDownload) {
    const componentName = component.name || 'component';
    const localBinLocation = path.join(
        process.cwd(),
        INSTALLATION_DEFAULTS.COMPONENTS_FOLDER,
        _.get(component, 'local.dir', ''),
        _.get(component, 'local.bin', ''),
    );

    const downloadedBinLocation = path.join(
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

async function downloadSteveDore(location, bypassDownload = false) {
    return await getComponent(location, components.stevedore, bypassDownload);
}

async function downloadHybridComponents(location, bypassDownload = false) {
    await downloadVeonona(location, bypassDownload);
    console.log(`Kubernetes components installer downloaded successfully to ${location} `);
    await downloadSteveDore(location, bypassDownload);
    console.log(`Kubernetes registrator installer downloaded successfully ${location}`);
}

/* eslint-disable no-restricted-syntax, no-await-in-loop */
async function downloadComponents(location = CODEFRESH_PATH, componentsArg = []) {
    const componentsArray = _.isArray(componentsArg) ? componentsArg : [componentsArg];
    for (const component of componentsArray) {
        switch (component) {
            case 'stevedore':
                await downloadSteveDore(location);
                console.log(colors.green(`Kubernetes registrator installer downloaded successfully to ${location}`));
                break;
            case 'venona':
                await downloadVeonona(location);
                console.log(colors.green(`Kubernetes components installer downloaded successfully to ${location}`));
                break;
            default:
                console.log(colors.yellow(`Skip unknown component ${component}`));
        }
    }
}
/* eslint-enable no-restricted-syntax, no-await-in-loop */

module.exports = {
    createErrorHandler,
    createTestPipeline,
    updateTestPipelineRuntime,
    executeTestPipeline,
    getTestPipelineLink,
    downloadRelatedComponents: downloadHybridComponents,
    downloadComponents,
    downloadSteveDore,
    INSTALLATION_DEFAULTS,
    DefaultLogFormatter,
};
