/* eslint-disable max-len */
const Command = require('../../Command');
const { sdk } = require('../../../../logic');

const installAgentCmd = new Command({
    root: true,
    command: 'install agent',
    description: 'Install an agent on kubernetes cluster',
    usage: 'install [$AGENT_ID]',
    webDocs: {
        category: 'Agents',
        title: 'Install',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be created if token is not provided',
        })
        .option('token', {
            describe: 'Agent\'s token',
        })
        .option('kubeContextName', {
            alias: 'kube-context-name',
            describe: 'Name of the kubernetes context on which venona should be installed (default is current-context) [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('buildAnnotations', {
            alias: 'build-annotations',
            describe: 'The kubernetes metadata.annotations as "key=value" to be used by venona build resources (default is no node selector) (stringArray)',
        })
        .option('buildNodeSelector', {
            alias: 'build-node-selector',
            describe: 'The kubernetes node selector "key=value" to be used by venona resources (default is no node selector) (string)',
        })
        .option('kubeNodeSelector', {
            alias: 'kube-node-selector',
            describe: 'The kubernetes node selector "key=value" to be used by venona build resources (default is no node selector) (string)',
        })
        .option('clusterName', {
            alias: 'cluster-name',
            describe: 'cluster name (if not passed runtime-environment will be created cluster-less); this is a friendly name used for metadata. does not need to match the literal cluster name.  Limited to 20 Characters (string)',
        })
        .option('dryRun', {
            alias: 'dry-run',
            describe: 'Set to true to simulate installation',
        })
        .option('inCluster', {
            alias: 'in-cluster',
            describe: 'Set flag if venona is been installed from inside a cluster',
        })
        .option('kubeNamespace', {
            alias: 'kube-namespace',
            describe: 'Name of the namespace on which venona should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kubernetesRunnerType', {
            alias: 'kubernetes-runner-type',
            describe: 'Set the runner type to kubernetes (alpha feature)',
        })
        .option('onlyRuntimeEnvironment', {
            alias: 'only-runtime-environment',
            describe: 'Set to true to only configure namespace as runtime-environment for Codefresh',
        })
        .option('runtimeEnvironment', {
            alias: 'runtime-environment',
            describe: 'if --skip-runtime-installation set, will try to configure venona on current runtime-environment',
        })
        .option('setDefault', {
            alias: 'set-default',
            describe: 'Mark the install runtime-environment as default one after installation',
        })
        .option('skipRuntimeInstallation', {
            alias: 'skip-runtime-installation',
            describe: 'Set flag if you already have a configured runtime-environment, add --runtime-environment flag with name',
        })
        .option('storageClass', {
            alias: 'storage-class',
            describe: 'Set a name of your custom storage class, note: this will not install volume provisioning components (string)',
        })
        .option('tolerations', {
            alias: 'tolerations',
            describe: 'The kubernetes tolerations as path to a  JSON file to be used by venona resources (default is no tolerations) (string)',
        })
        .option('venonaVersion', {
            alias: 'venona-version',
            describe: 'Version of venona to install (default is the latest)',
        })
        .option('kubeConfigPath', {
            alias: 'kube-config-path',
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('skipVersionCheck', {
            alias: 'skip-version-check',
            describe: 'Do not compare current Venona\'s version with latest',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        let {
            name, token,
        } = argv;
        const {
            kubeContextName, kubeNamespace, buildAnnotations, buildNodeSelector, clusterName, dryRun,
            inCluster, kubeNodeSelector, kubernetesRunnerType, onlyRuntimeEnvironment, runtimeEnvironment,
            setDefault, skipRuntimeInstallation, storageClass, tolerations, venonaVersion, kubeConfigPath,
            skipVersionCheck, verbose,
        } = argv;
        let agent;
        if (!token) { // Create an agent if not provided
            name = name || `${kubeContextName}_${kubeNamespace}`;
            agent = await sdk.agents.create({ name });
            // eslint-disable-next-line prefer-destructuring
            token = agent.token;
        }
        await sdk.agents.install({
            kubeContextName,
            kubeNamespace,
            token,
            buildAnnotations,
            buildNodeSelector,
            clusterName,
            dryRun,
            inCluster,
            kubeNodeSelector,
            kubernetesRunnerType,
            onlyRuntimeEnvironment,
            runtimeEnvironment,
            setDefault,
            skipRuntimeInstallation,
            storageClass,
            tolerations,
            venonaVersion,
            kubeConfigPath,
            skipVersionCheck,
            verbose,
        });
    },
});

module.exports = installAgentCmd;
