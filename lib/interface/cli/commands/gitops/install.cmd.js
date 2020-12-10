/* eslint-disable max-len */
const _ = require('lodash');
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { detectProxy } = require('../../helpers/general');
const { downloadProvider } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');
const { install: installArgocd } = require('./install-argocd');

const installArgoCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'gitops <provider>',
    description: 'Install gitops',
    webDocs: {
        category: 'Gitops',
        title: 'Install',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_')
        .positional('provider', {
            describe: 'Gitops provider',
            choices: ['codefresh', 'argocd-agent'],
            required: true,
        })
        .option('git-integration', {
            describe: 'Name of git integration in Codefresh',
        })
        .option('codefresh-integration', {
            describe: 'Name of gitops integration in Codefresh',
        })
        .option('argo-host', {
            describe: 'Host of argocd installation',
        })
        .option('argo-token', {
            describe: 'Token of argocd installation. Preferred auth method',
        })
        .option('argo-username', {
            default: 'admin',
            describe: 'Username of existing argocd installation. Should be used with argo-password',
        })
        .option('argo-password', {
            describe: 'Password of existing argocd installation. Should be used with argo-username',
        })
        .option('update', {
            describe: 'Update gitops integration if exists',
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
        })
        // argocd options
        .option('install-manifest', {
            describe: 'Url of argocd install manifest',
            default: 'https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml',
        })
        .option('set-argo-password', {
            describe: 'Set password for admin user of new argocd installation',
        }),
    handler: async (argv) => {
        let {
            provider,
            'http-proxy': httpProxy,
            'https-proxy': httpsProxy,
            'argo-host': argoHost,
            'argo-username': argoUsername,
            'argo-password': argoPassword,
        } = argv;
        const {
            'kube-config-path': kubeConfigPath,
            'install-manifest': installManifest,
            'kube-namespace': kubeNamespace,
            'set-argo-password': setArgoPassword,
        } = argv;

        if (provider === 'codefresh') {
            if (!setArgoPassword) {
                console.error('\nMissing required argument: set-argo-password');
                process.exit(1);
            }

            if (!kubeNamespace) {
                console.error('\nMissing required argument: kube-namespace');
                process.exit(1);
            }

            const result = await installArgocd({
                installManifest,
                kubeNamespace,
                setArgoPassword,
            });

            provider = 'argocd-agent';
            argoHost = result.host;
            argoUsername = 'admin';
            argoPassword = setArgoPassword;
        }

        const binLocation = await downloadProvider({ provider });
        const componentRunner = new Runner(binLocation);

        const commands = [
            'install',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }

        const installOptions = _.pick(argv, ['git-integration', 'codefresh-integration', 'argo-token', 'output',
            'update', 'kube-context-name', 'kube-namespace', 'sync-mode', 'sync-apps']);
        installOptions['argo-host'] = argoHost;
        installOptions['argo-username'] = argoUsername;
        installOptions['argo-password'] = argoPassword;

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
