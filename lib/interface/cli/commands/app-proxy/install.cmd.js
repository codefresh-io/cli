const colors = require('colors');

const _ = require('lodash');
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const {
    INSTALLATION_DEFAULTS,
    installAppProxy,
    createErrorHandler,
    drawCodefreshFiglet,
} = require('../hybrid/helper');
const { getKubeContext } = require('../../helpers/kubernetes');
const sdk = require('../../../../logic/sdk');
const { to } = require('../../../../logic/cli-config/errors/awaitTo');
const { mergeWithValues, selectRuntime } = require('./helper');

const openIssueMessage = 'If you had any issues with this installation process please report them at:'
    + ` ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

function printInstallationOptionsSummary({
    kubeContextName,
    kubeNamespace,
    host,
    runtimeEnvironment,
}) {
    const summary = `\n${colors.green('Installation options summary:')} 
    1. Kubernetes Context: ${colors.cyan(kubeContextName)}
    2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
    3. App-Proxy hostname: ${colors.cyan(host)}
    4. Runtime-Environment: ${colors.cyan(runtimeEnvironment)}
   `;
    console.log(summary);
}


const installAppProxyHandler = new Command({
    root: false,
    parent: installRoot,
    command: 'app-proxy',
    description: 'Install the App-Proxy component on your Kubernetes cluster',
    webDocs: {
        category: 'App-Proxy',
        title: 'Install',
        weight: 100,
    },

    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file [$KUBECONFIG]',
            default: INSTALLATION_DEFAULTS.KUBECONFIG_PATH,
            type: 'string',
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which the app-proxy should be installed'
                + ` (default: ${getKubeContext()}) [$CF_ARG_KUBE_CONTEXT_NAME]`,
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which app-proxy should be installed (default:'
                + ` ${INSTALLATION_DEFAULTS.NAMESPACE}) [$CF_ARG_KUBE_NAMESPACE]`,
            type: 'string',
        })
        .option('runtime-environment', {
            describe: 'The Codefresh runtime-environment that this app-proxy will be associated with',
            type: 'string',
        })
        .option('docker-registry', {
            describe: 'The prefix for the container registry that will be used for pulling the app-proxy component image',
            default: 'docker.io',
            type: 'string',
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
        })
        .option('host', {
            describe: 'the hostname that will be used by the app-proxy ingress',
            type: 'string',
        })
        .option('ingress-class', {
            describe: 'the ingress class that will be used by the app-proxy ingress',
            type: 'string',
        }),

    handler: async (_argv) => {
        const argv = mergeWithValues(_argv);
        const {
            'kube-config-path': kubeConfigPath,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'docker-registry': dockerRegistry,
            verbose,
            values,
            'set-value': setValues,
            host,
            'ingress-class': ingressClass,
            noExit,
        } = argv;
        let {
            'runtime-environment': runtimeEnvironment,
        } = argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get account\'s runtime environments');
        const runtimeNames = runtimes.reduce((acc, re) => {
            if (_.get(re, 'metadata.agent')) {
                acc.push(_.get(re, 'metadata.name'));
            }
            return acc;
        }, []);

        if (_.isEmpty(runtimeNames)) {
            await handleError(
                new Error('no runtime environments found'),
                'Cannot install app-proxy without a Codefresh runtime-environment',
            );
        }
        if (!runtimeEnvironment || !runtimeNames.find(re => re === runtimeEnvironment)) {
            if (runtimeEnvironment) {
                console.log(colors.bold(`Runtime-environment "${colors.cyan(runtimeEnvironment)}" `
                    + 'was not found, please choose on of the following:'));
            }
            runtimeEnvironment = await selectRuntime(runtimeNames);
        }

        printInstallationOptionsSummary({
            kubeContextName,
            kubeNamespace,
            host,
            runtimeEnvironment,
        });

        console.log('installing app-proxy...');
        const appProxyUrl = await installAppProxy({
            apiHost: sdk.config.context.url,
            appProxyHost: host,
            appProxyIngressClass: ingressClass,
            kubeConfigPath,
            kubeContextName,
            kubeNamespace,
            dockerRegistry,
            valuesFile: values,
            setValue: setValues,
            verbose,
        });

        const [getREErr, re] = await to(sdk.runtimeEnvs.get({ name: runtimeEnvironment }));
        await handleError(getREErr, 'Failed to get runtime environment');

        const body = {
            appProxy: {
                externalIP: appProxyUrl,
            },
        };
        console.log(`updating runtime-environment ${colors.cyan(runtimeEnvironment)} with app-proxy url`);
        await sdk.runtimeEnvs.update({ name: runtimeEnvironment }, _.merge(re, body));
        console.log(`runtime-environment ${colors.cyan(runtimeEnvironment)} updated`);

        console.log(openIssueMessage);
        await drawCodefreshFiglet();
        if (!noExit) {
            process.exit();
        }
    },

});

module.exports = installAppProxyHandler;
