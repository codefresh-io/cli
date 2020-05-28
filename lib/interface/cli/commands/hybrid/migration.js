const _ = require('lodash');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { sdk } = require('../../../../logic');
const installAgent = require('../agent/install.cmd');
const attachRuntime = require('../runtimeEnvironments/attach.cmd');
const installMonitoring = require('../monitor/install.cmd');
const pipelinesRunCmd = require('../pipeline/run.cmd');
const colors = require('colors');
const cliProgress = require('cli-progress');
const ProgressEvents = require('../../helpers/progressEvents');
const { followLogs } = require('../../helpers/logs');
const inquirer = require('inquirer');

const TEST_PIPELINE_NAME = 'Codefresh Migration Test';

async function getNewAgentName(kubeContextName, kubeNamespace, agents) {
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

function getProgressBar() {
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

async function createTestPipeline(runtimeName, pipelineName, pipelineCommands) {
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

    return pipeline;
}

async function createAndExecuteTestPipeline(runtimeName, pipelineName, pipelineCommands, errHandler) {
    let demoPipelineExists = false;
    const url = _.get(sdk, 'config.context.url', 'https://g.codefresh.io');

    const [getPipelinesError, pipelines] = await to(sdk.pipelines.list({ id: pipelineName }));
    if (getPipelinesError) {
        console.log(`Failed to fetch account pipelines, cause: ${getPipelinesError.message}`);
    } else if (_.get(pipelines, 'docs.length')) {
        demoPipelineExists = true;
    }

    if (!demoPipelineExists) {
        console.log(`Creating test pipeline with the name: "${colors.cyan(pipelineName)}"`);
        const [createDemoPipelineError, pipeline] = await to(createTestPipeline(runtimeName, pipelineName, pipelineCommands));
        await errHandler(createDemoPipelineError, 'Failed to create demo pipeline');
        const pipelineLink = `${url}/pipelines/edit/workflow?id=${pipeline.metadata.id}&pipeline=${encodeURI(pipeline.metadata.name)}`;
        console.log(`Created test pipeline with the name "${colors.cyan(pipelineName)}". Watch it here: ${colors.blue(pipelineLink)}`);
    } else {
        const pipeline = pipelines.docs[0];
        const pipelineLink = `${url}/pipelines/edit/workflow?id=${pipeline.metadata.id}&pipeline=${encodeURI(pipeline.metadata.name)}`;
        console.log(`Test pipeline with the name: "${colors.cyan(pipelineName)}" already exists.` +
            ` Watch it here: ${colors.blue(pipelineLink)}`);
    }

    const [pipelineExecutionError, workflowId] = await to(pipelinesRunCmd.handler({
        name: pipelineName,
        exitProcess: false,
        annotation: [],
        'runtime-name': runtimeName,
        returnWorkflowId: true,
    }));
    await errHandler(pipelineExecutionError, 'Failed to run demo pipeline');
    const buildLink = `${url}/build/${workflowId}`;
    console.log(`Executing pipeline "${colors.cyan(pipelineName)}", watch it at: ${colors.blue(buildLink)}`);
    await followLogs(workflowId);
}

async function migrate({
    runtimeName,
    kubeContextName,
    kubeNamespace,
    agentName,
    handleError,
    kubeNodeSelector,
    tolerations,
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
    console.log('\u2022 Run a test pipeline to check that the migration was successful');

    const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'migrationConfirmed',
        default: false,
        message: 'Are you sure you want to proceed with the migration process? (default is NO)',
    });
    if (!answer.migrationConfirmed) {
        console.log('Migration process aborted, exiting...');
        process.exit(1);
    }

    // delete old agent
    console.log(`Running migration script on runtime: ${colors.cyan(runtimeName)}`);
    const [migrateScriptErr, migrateScriptExitCode] = await to(sdk.agents.migrate({
        kubeContextName, // kube-context-name
        kubeNamespace, // --kube-namespace
        verbose,
        events: getProgressBar(),
    }));
    handleError(migrateScriptErr, 'Failed to execute migration script');
    if (migrateScriptExitCode !== 0) {
        handleError(new Error(`migration script exited with code ${migrateScriptExitCode}`), 'Migration failed');
    }

    // install new agent
    console.log(`Creating new codefresh agent with name: ${colors.cyan(newAgentName)}`);
    const agentInstallOptions = {
        name: newAgentName,
        'kube-context-name': kubeContextName,
        'kube-node-selector': kubeNodeSelector,
        'kube-namespace': kubeNamespace,
        tolerations,
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
    const [runPipelineErr] = await to(createAndExecuteTestPipeline(
        runtimeName,
        TEST_PIPELINE_NAME,
        [`echo runtime ${runtimeName} migrated successfully!`],
        handleError,
    ));
    await handleError(runPipelineErr, 'Failed to run test pipeline');
}

async function upgrade({ kubeContextName, kubeNamespace, agentName }) {
    console.log('upgrading...');
}
module.exports = {
    migrate,
    upgrade,
};
