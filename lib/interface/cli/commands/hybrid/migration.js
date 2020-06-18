const _ = require('lodash');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { sdk } = require('../../../../logic');
const installAgent = require('../agent/install.cmd');
const installMonitoring = require('../monitor/install.cmd');
const colors = require('colors');
const inquirer = require('inquirer');
const fs = require('fs');
const {
    getTestPipeline,
    updateTestPipelineRuntime,
    createTestPipeline,
    executeTestPipeline,
    createProgressBar,
} = require('./helper');
const { getNewAgentName } = require('../agent/helper');

const TEST_PIPELINE_NAME = 'CF_Runner_Migration_test';

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
    } else {
        const [updatePipelineErr] = await to(updateTestPipelineRuntime(testPipeline, runtimeName));
        if (updatePipelineErr) {
            console.log(colors.yellow('*warning* failed to update test pipeline runtime, you can' +
                ' change it manually if you want to run it again on this runtime'));
        }
    }
    const [runPipelineErr] = await to(executeTestPipeline(
        runtimeName,
        testPipeline.metadata.name,
    ));
    await errHandler(runPipelineErr, 'Failed to run test pipeline');
}

async function migrate({
    runtimeName,
    kubeContextName,
    kubeNamespace,
    installMonitor,
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
    const [getRuntimeErr, runtime] = await to(sdk.runtimeEnvs.get({ name: runtimeName }));
    handleError(getRuntimeErr, `Failed to get runtime with name "${runtimeName}"`);
    const oldNodeSelector = _.get(runtime, 'runtimeScheduler.cluster.nodeSelector');
    const oldStorageClassName = _.get(runtime, 'dockerDaemonScheduler.pvcs.dind.storageClassName');

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

    // prepare old runtime
    if (oldStorageClassName && oldStorageClassName.startsWith('dind-local-volumes-venona')) {
        // need to replace to start with 'dind-local-volumes-runner'
        const newRe = _.set(runtime, 'dockerDaemonScheduler.pvcs.dind.storageClassName', oldStorageClassName.replace('venona', 'runner'));
        const [err] = await to(sdk.runtimeEnvs.update({ name: runtimeName }, newRe));
        handleError(err, 'Failed to update runtime storage class name');
    }

    // delete old agent and runtime
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

    // install new agent and runtime
    console.log(`Creating new codefresh runner with name: ${colors.cyan(newAgentName)}`);
    const agentInstallOptions = {
        name: newAgentName,
        'kube-context-name': kubeContextName,
        'kube-node-selector': oldConfig.nodeSelector,
        'build-node-selector': oldNodeSelector,
        'kube-namespace': kubeNamespace,
        'agent-kube-namespace': kubeNamespace,
        'agent-kube-context-name': kubeContextName,
        'agent-kube-config-path': kubeConfigPath,
        tolerations: JSON.stringify(oldConfig.tolerations),
        'kube-config-path': kubeConfigPath,
        'install-runtime': true,
        'runtime-name': runtimeName,
        'skip-re-creation': true,
        verbose,
        'make-default-runtime': shouldMakeDefaultRe,
        'storage-class-name': storageClassName || oldStorageClassName,
        terminateProcess: false,
        'set-value': setValue,
        'set-file': setFile,
    };
    const [agentInstallErr] = await to(installAgent.handler(agentInstallOptions));
    handleError(agentInstallErr, 'Failed to install new agent and runtime');

    // Install new monitoring components
    if (installMonitor) {
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
    }

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
