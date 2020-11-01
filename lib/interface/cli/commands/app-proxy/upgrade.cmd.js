/* eslint-disable max-len */
const Command = require('../../Command');
const upgradeRoot = require('../root/upgrade.cmd');
const {
    mergeWithValues,
    selectNamespace,
} = require('./helper');
const colors = require('colors');
const { to } = require('../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    drawCodefreshFiglet,
    upgradeAppProxy,
    INSTALLATION_DEFAULTS,
} = require('../hybrid/helper');
const { getKubeContext } = require('../../helpers/kubernetes');

const openIssueMessage = `If you had any issues with the process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

const upgradeAppProxyHandler = new Command({
    root: false,
    parent: upgradeRoot,
    command: 'app-proxy',
    description: 'Upgrades an existing App-Proxy',
    webDocs: {
        category: 'App-Proxy',
        title: 'Upgrade',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which the app-proxy is installed'
                + ' (default: current context) [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the kubernetes namespace from which the App-Proxy and Runtime should be removed',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
            default: INSTALLATION_DEFAULTS.KUBECONFIG_PATH,
        })
        .option('values', {
            describe: 'specify values in a YAML file',
        })
        .option('set-value', {
            describe: 'Set values for templates, example: --set-value LocalVolumesDir=/mnt/disks/ssd0/codefresh-volumes',
            type: 'array',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (_argv) => {
        const argv = mergeWithValues(_argv);
        const {
            'kube-config-path': kubeConfigPath,
            verbose,
            values,
            'set-value': setValues,
            noExit,
        } = argv;
        let {
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
        } = argv;

        console.log(colors.green('This installer will guide you through the App-Proxy upgrade process'));

        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }

        if (!kubeNamespace) {
            kubeNamespace = await selectNamespace();
        }

        console.log(`\n${colors.green('Upgrade options summary:')} 
1. Kubernetes Context: ${colors.cyan(kubeContextName)}
2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
`);

        const [upgradeErr] = await to(upgradeAppProxy({
            kubeConfigPath,
            kubeContextName,
            kubeNamespace,
            verbose,
            valuesFile: values,
            setValue: setValues,
        }));
        handleError(upgradeErr, 'Failed to upgrade app-proxy');

        console.log('Successfully upgraded App-Proxy');
        console.log(openIssueMessage);
        await drawCodefreshFiglet();
        if (!noExit) {
            process.exit(); // TODO : This is not needed - needed to be fixed
        }
    },
});

module.exports = upgradeAppProxyHandler;
