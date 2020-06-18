/* eslint-disable max-len */
const Command = require('../../Command');
const deleteAgent = require('../agent/delete.cmd');
const unInstallRoot = require('../root/uninstall.cmd');
const { sdk } = require('../../../../logic');
const { getKubeContext } = require('../../helpers/kubernetes');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');
const { DefaultLogFormatter } = require('./../hybrid/helper');


const unInstallAgentCmd = new Command({
    root: false,
    parent: unInstallRoot,
    command: 'agent',
    description: 'Uninstall an agent on kubernetes cluster',
    webDocs: {
        category: 'Agents',
        title: 'Uninstall',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be uninstalled',
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which venona should be uninstalled [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which venona should be uninstalled [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            name,
            'kube-namespace': kubeNamespace,
            'kube-config-path': kubeConfigPath,
            terminateProcess,

        } = argv;

        let { 'kube-context-name': kubeContextName } = argv;

        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }

        if (!name) {
            throw new Error('Name is a mandatory parameter');
        }

        const events = new ProgressEvents();
        const format = 'downloading [{bar}] {percentage}% | {value}/{total}';
        const progressBar = new cliProgress.SingleBar({ stopOnComplete: true, format }, cliProgress.Presets.shades_classic);
        let totalSize;
        events.onStart((size) => {
            progressBar.start(size, 0);
            totalSize = size;
        });
        events.onProgress((progress) => {
            progressBar.update(progress);
            if (progress >= totalSize) {
                console.log('\n');
            }
        });


        const exitCode = await sdk.agents.unInstall({
            kubeContextName,
            kubeNamespace,
            kubeConfigPath,
            terminateProcess: false,
            events,
            logFormatting: DefaultLogFormatter,
        });
        if (exitCode === 0) {
            console.log('Agent uninstalled successfully');
            await deleteAgent.handler({ name, id: name });
        }
        if (terminateProcess !== false) {
            process.exit(0);
        }
    },
});

module.exports = unInstallAgentCmd;
