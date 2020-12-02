/* eslint-disable max-len */
const _ = require('lodash');
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { detectProxy } = require('../../helpers/general');
const { downloadProvider } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');

const installArgoCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'gitops <provider>',
    description: 'Install gitops agent',
    webDocs: {
        category: 'Gitops',
        title: 'Install',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_')
        .positional('provider', {
            describe: 'Gitops provider',
            choices: ['argocd-agent'],
            required: true,
        })
        .option('git-integration', {
            describe: 'Name of git integration in Codefresh',
        })
        .option('codefresh-integration', {
            describe: 'Name of argocd integration in Codefresh',
        })
        .option('argo-host', {
            describe: 'Host of argocd installation',
        })
        .option('argo-token', {
            describe: 'Token of argocd installation. Preferred auth method',
        })
        .option('argo-username', {
            describe: 'Username of argocd installation. Should be used with argo-password',
        })
        .option('argo-password', {
            describe: 'Username of argocd installation. Should be used with argo-username',
        })
        .option('update', {
            describe: 'Update argocd integration if exists',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('kube-context-name', {
            describe: 'Name of Kubernetes context',
        })
        .option('kube-namespace', {
            describe: 'Namespace in Kubernetes cluster',
        })
        .option('output', {
            describe: 'Path to k8s manifest output file, example: -o /home/user/out.yaml',
            alias: 'o',
        })
        .option('sync-mode', {
            choices: ['NONE', 'SELECT', 'CONTINUE_SYNC', 'ONE_TIME_SYNC'],
            describe: 'Synchronization mode\nNONE - don\'t synchronize\nSELECT - select applications for synchronization\nCONTINUE_SYNC - continuous synchronization\nONE_TIME_SYNC - synchronize one time',
        })
        .option('sync-apps', {
            array: true,
            describe: 'Applications to be synchronized',
        })
        .option('http-proxy', {
            describe: 'http proxy to be used in the runner',
        })
        .option('https-proxy', {
            describe: 'https proxy to be used in the runner',
        }),
    handler: async (argv) => {
        let {
            // eslint-disable-next-line prefer-const
            'kube-config-path': kubeConfigPath,
            // eslint-disable-next-line prefer-const
            provider,
            'http-proxy': httpProxy,
            'https-proxy': httpsProxy,
        } = argv;

        const binLocation = await downloadProvider({ provider });
        const componentRunner = new Runner(binLocation);

        const commands = [
            'install',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }

        const installOptions = _.pick(argv, ['git-integration', 'codefresh-integration', 'argo-host', 'argo-token', 'output',
            'argo-username', 'argo-password', 'update', 'kube-context-name', 'kube-namespace', 'sync-mode', 'sync-apps']);

        _.forEach(installOptions, (value, key) => {
            if (_.isArray(value)) {
                value.forEach((item) => {
                    commands.push(`--${key}`);
                    commands.push(item);
                });
            } else {
                commands.push(`--${key}`);
                if (value !== true) commands.push(value);
            }
        });

        const detectedProxyVars = detectProxy();
        httpProxy = httpProxy || detectedProxyVars.httpProxy;
        httpsProxy = httpsProxy || detectedProxyVars.httpsProxy;

        if (httpProxy) {
            commands.push('--http-proxy');
            commands.push(httpProxy);
        }

        if (httpsProxy) {
            commands.push('--https-proxy');
            commands.push(httpsProxy);
        }


        await componentRunner.run(components.gitops[provider], commands);
    },
});

module.exports = installArgoCmd;
