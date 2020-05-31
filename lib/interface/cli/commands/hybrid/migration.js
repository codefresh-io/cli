const _ = require('lodash');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { sdk } = require('../../../../logic');
const installAgent = require('../agent/install.cmd');
const attachRuntime = require('../runtimeEnvironments/attach.cmd');
const installMonitoring = require('../monitor/install.cmd');
const colors = require('colors');
const inquirer = require('inquirer');
const fs = require('fs');
const {
    getTestPipeline,
    createTestPipeline,
    executeTestPipeline,
    createProgressBar,
} = require('./helper');
const { getNewAgentName } = require('../agent/helper');

const TEST_PIPELINE_NAME = 'Codefresh Migration Test';

async function createAndRunTestPipeline(runtimeName, errHandler) {
    let testPipeline;
    const [getPipelineErr, _testPipeline] = await to(getTestPipeline(TEST_PIPELINE_NAME));
    testPipeline = _testPipeline;
    await errHandler(getPipelineErr, 'Could not get test pipeline');
    if (!testPipeline) {
        // eslint-disable-next-line no-shadow
        const [createPipelineErr, _testPipeline] = await to(createTestPipeline(
            runtimeName,
            TEST_PIPELINE_NAME,
            [`echo runtime ${runtimeName} migrated successfully!`],
        ));
        await errHandler(createPipelineErr, 'Failed to create test pipeline');
        testPipeline = _testPipeline;
    }
    const [runPipelineErr] = await to(executeTestPipeline(
        runtimeName,
        testPipeline,
    ));
    await errHandler(runPipelineErr, 'Failed to run test pipeline');
}

async function migrate({
    runtimeName,
    kubeContextName,
    kubeNamespace,
    agentName,
    handleError,
    kubeConfigPath,
    shouldMakeDefaultRe,
    storageClassName,
    setValue,
    setFile,
    verbose,
    agents,
}) {
    const newAgentName = agentName || await getNewAgentName(kubeContextName, kubeNamespace, agents);

    // prompt migration process confirmation
    console.log(`${colors.red('This migration process will do the following:')}`);
    console.log('\u2022 Delete the old venona deployment and secrets from the selected namespace');
    console.log(`\u2022 Create a new Codefresh runner with the name "${colors.cyan(newAgentName)}" on the selected namespace`);
    console.log(`\u2022 Attach runtime "${colors.cyan(runtimeName)}" to the new Codefresh runner`);
    console.log('\u2022 Install Codefresh runner monitoring components on the selected namespace');
    console.log('\u2022 Run a test pipeline to check that the migration was successful\n');

    const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'migrationConfirmed',
        default: false,
        message: 'Are you sure you want to proceed with the migration process?',
    });
    if (!answer.migrationConfirmed) {
        console.log('Migration process aborted, exiting...');
        process.exit(1);
    }

    // delete old agent
    console.log(`Running migration script on runtime: ${colors.cyan(runtimeName)}`);
    const [migrateScriptErr, migrateScriptExitCode] = await to(sdk.agents.migrate({
        kubeContextName,
        kubeNamespace,
        verbose,
        events: createProgressBar(),
    }));
    handleError(migrateScriptErr, 'Failed to execute migration script');
    if (migrateScriptExitCode !== 0) {
        handleError(new Error(`migration script exited with code ${migrateScriptExitCode}`), 'Migration failed');
    }

    // read old deploment configuration
    const filename = './migration.json';
    let oldConfig = {};
    try {
        const data = fs.readFileSync(filename).toString('utf-8');
        oldConfig = JSON.parse(data);
    } catch (err) {
        console.log(colors.yellow(`could not read old deployment configuration file: ${err}`));
    }

    if (oldConfig.tolerations) {
        oldConfig.tolerations = oldConfig.tolerations.filter(t => !t.key.includes('node.kubernetes.io'));
    }

    if (oldConfig.nodeSelector) {
        const key = _.keys(oldConfig.nodeSelector)[0];
        oldConfig.nodeSelector = `${key}=${oldConfig.nodeSelector[key]}`;
    }

    // install new agent
    console.log(`Creating new codefresh agent with name: ${colors.cyan(newAgentName)}`);
    const agentInstallOptions = {
        name: newAgentName,
        'kube-context-name': kubeContextName,
        'kube-node-selector': oldConfig.nodeSelector,
        'kube-namespace': kubeNamespace,
        tolerations: JSON.stringify(oldConfig.tolerations),
        'kube-config-path': kubeConfigPath,
        'install-runtime': false,
        verbose,
        'make-default-runtime': shouldMakeDefaultRe,
        'storage-class-name': storageClassName,
        terminateProcess: false,
        'set-value': setValue,
        'set-file': setFile,
    };
    const [agentInstallErr] = await to(installAgent.handler(agentInstallOptions));
    handleError(agentInstallErr, 'Failed to install new agent');

    // attach old runtime to new agent
    console.log(`Attaching runtime: ${colors.cyan(runtimeName)} to agent: ${colors.cyan(newAgentName)}`);
    const [attachRuntimeErr] = await to(attachRuntime.handler({
        'agent-name': newAgentName,
        'runtime-name': runtimeName,
        'runtime-kube-context-name': kubeContextName,
        'runtime-kube-namespace': kubeNamespace,
        'runtime-kube-config-path': kubeConfigPath,
        'agent-kube-context-name': kubeContextName,
        'agent-kube-namespace': kubeNamespace,
        'agent-kube-config-path': kubeConfigPath,
        'restart-agent': true,
        terminateProcess: false,
        verbose,
    }));
    handleError(attachRuntimeErr, 'Failed to attach the old runtime to the new agent');

    // Install new monitoring components
    console.log('Installing monitoring components');
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
    await handleError(monitorErr, 'Monitor installation failed');

    // Execute test pipeline on new runner
    await createAndRunTestPipeline(runtimeName, handleError);
}

async function upgrade({ kubeContextName, kubeNamespace, agentName }) {
    console.log('Upgrade is not yet supported. You can manually upgrade your Codefresh runner by reinstalling it.');
}
module.exports = {
    migrate,
    upgrade,
};
