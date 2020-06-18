/* eslint-disable max-len */
const Command = require('../../Command');
const unInstallRoot = require('../root/uninstall.cmd');
const { sdk } = require('../../../../logic');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');
const { DefaultLogFormatter } = require('./../hybrid/helper');


const unInstallAgentCmd = new Command({
    root: false,
    parent: unInstallRoot,
    command: 'monitor',
    description: 'Uninstall an monitor on kubernetes cluster',
    webDocs: {
        category: 'Monitor',
        title: 'Uninstall',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which monitor should be uninstalled [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which monitor should be uninstalled [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'kube-namespace': kubeNamespace,
            'kube-config-path': kubeConfigPath,
            'kube-context-name': kubeContextName,
            noExit,
        } = argv;

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


        const exitCode = await sdk.monitor.unInstall({
            kubeContextName,
            kubeNamespace,
            kubeConfigPath,
            terminateProcess: false,
            events,
            logFormatting: DefaultLogFormatter,
        });
        if (exitCode === 0) {
            console.log('Monitor uninstalled successfully');
            if (!noExit) {
                process.exit(0);
            }
        }
        if (!noExit) {
            process.exit(1);
        }
    },
});

module.exports = unInstallAgentCmd;
