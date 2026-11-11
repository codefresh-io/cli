const colors = require('colors');
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const { to } = require('../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    createTestPipeline,
    getTestPipeline,
    updateTestPipelineRuntime,
    executeTestPipeline,
    INSTALLATION_DEFAULTS,
} = require('./helper');

const handleError = createErrorHandler(`\nIf you had any issues with the test pipeline please report them at:\
 ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`);

const defaultDockerRegistry = 'quay.io';

const command = new Command({
    command: 'execute-test-pipeline',
    parent: runnerRoot,
    requiresAuthentication: true,
    description: 'Executes test pipeline',
    webDocs: {
        category: 'Runner',
        title: 'Execute test pipeline',
    },
    builder: (yargs) => yargs
        .option('runtime-name', {
            describe: 'Runtime name to execute pipeline on',
        }),
    handler: async (argv) => {
        const runtimeName = argv.runtimeName ? argv.runtimeName.trim() : argv.runtimeName;
        const pipelineName = INSTALLATION_DEFAULTS.DEMO_PIPELINE_NAME;

        const [getErr, pipeline] = await to(getTestPipeline(pipelineName));
        handleError(getErr, 'Failed to get test pipeline');

        if (!pipeline) {
            const [createErr] = await to(createTestPipeline(
                runtimeName,
                pipelineName,
                ['echo hello Codefresh Runner!'],
                defaultDockerRegistry,
            ));
            handleError(createErr, 'Failed to create test pipeline');
        } else {
            const [updateErr] = await to(updateTestPipelineRuntime(pipeline, runtimeName, pipelineName, defaultDockerRegistry));
            if (updateErr) {
                handleError(updateErr, colors.yellow('*warning* could not update test pipeline runtime, you can'
                    + ' change it manually if you want to run it again on this runtime'), false);
            } else {
                console.log('Updated test pipeline runtime');
            }
        }

        const [execErr] = await to(executeTestPipeline(runtimeName, pipelineName));
        handleError(execErr, 'Failed to execute test pipeline');
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = command;
