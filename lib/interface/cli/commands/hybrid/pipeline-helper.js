const sdk = require('../../../../logic/sdk');
const colors = require('colors');
const installationProgress = require('./installation-process');
const _ = require('lodash');

const {
    createTestPipeline,
    executeTestPipeline,
    updateTestPipelineRuntime,
    INSTALLATION_DEFAULTS,
} = require('./helper');

const defaultDockerRegistry = 'quay.io';

async function addPipelineToInstallationPlan(installationPlan, dockerRegistry = '', executePipeline = true) {
    if (!dockerRegistry) {
        // eslint-disable-next-line no-param-reassign
        dockerRegistry = defaultDockerRegistry;
    }

    const pipelines = await sdk.pipelines.list({ id: `${INSTALLATION_DEFAULTS.PROJECT_NAME}/${INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME}` });
    const testPipelineExists = !!_.get(pipelines, 'docs.length');

    if (!testPipelineExists) {
        installationPlan.addStep({
            name: 'create test pipeline',
            func: async () => {
                await createTestPipeline(
                    installationPlan.getContext('runtimeName'),
                    INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME,
                    ['echo hello Codefresh Runner!'],
                    dockerRegistry,
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
                    dockerRegistry,
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
        condition: executePipeline,
    });
}

module.exports = {
    addPipelineToInstallationPlan,
};
