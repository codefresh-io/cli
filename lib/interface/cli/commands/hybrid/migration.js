const _ = require('lodash');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const { sdk } = require('../../../../logic');
const installAgent = require('../agent/install.cmd');
const attachRuntime = require('../runtimeEnvironments/attach.cmd');
const colors = require('colors');

async function getNewAgentName(kubeContextName, kubeNamespace) {
    const defaultName = `${kubeContextName}_${kubeNamespace}`;
    const agents = await to(sdk.agents.list({ }));
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

async function migrate({
    runtimeName,
    kubeContext,
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
}) {
    // delete old agent
    const [migrateScriptErr] = await to(sdk.agents.migate({
        kubeContextName: kubeContext, // kube-context-name
        kubeNamespace, // --kube-namespace
    }));
    handleError(migrateScriptErr, 'Failed to run migration script');

    // install new agent
    const newAgentName = agentName || await getNewAgentName(kubeContext, kubeNamespace);
    const agentInstallOptions = {
        name: newAgentName,
        'kube-context-name': kubeContext,
        'kube-node-selector': kubeNodeSelector,
        'kube-namespace': kubeNamespace,
        tolerations,
        'kube-config-path': kubeConfigPath,
        'install-runtime': true,
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
    const attachRuntimeStatusCode = await attachRuntime.handler({
        'agent-name': newAgentName,
        'runtime-name': runtimeName,
        'runtime-kube-context-name': kubeContext,
        'runtime-kube-namespace': kubeNamespace,
        'runtime-kube-config-path': kubeConfigPath,
        'agent-kube-context-name': kubeContext,
        'agent-kube-namespace': kubeNamespace,
        'agent-kube-config-path': kubeConfigPath,
        'restart-agent': true,
        terminateProcess: false,
    });
    if (attachRuntimeStatusCode !== 0) {
        throw new Error(`Attach runtime failed with exit code ${attachRuntimeStatusCode}`);
    }
    console.log(colors.green('Migration ran successfully!'));
}

async function upgrade({ kubeContext, kubeNamespace, agentName }) {
    console.log('upgrading...');
}
module.exports = {
    migrate,
    upgrade,
};
