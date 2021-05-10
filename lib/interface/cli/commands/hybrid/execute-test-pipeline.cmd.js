const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const colors = require('colors');
const InstallationPlan = require('./InstallationPlan');
const { addPipelineToInstallationPlan } = require('./pipeline-helper');
const { createErrorHandler } = require('./helper');

const handleError = createErrorHandler(`\nIf you had any issues with the installation please report them at:\
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
    builder: yargs => yargs
        .option('runtime-name', {
            describe: 'Runtime name to execute pipeline on',
        }),
    handler: async (argv) => {
        const { runtimeName } = argv;

        const installationPlan = new InstallationPlan({ errHandler: handleError });
        installationPlan.addContext('runtimeName', runtimeName ? runtimeName.trim() : runtimeName);
        await addPipelineToInstallationPlan(installationPlan, defaultDockerRegistry, true);
        await installationPlan.execute();
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = command;
