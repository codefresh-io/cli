const { detectProxy } = require('../../../helpers/general');
const { downloadProvider } = require('../../hybrid/helper');
const { Runner, components } = require('../../../../../binary');
const _ = require('lodash');

class GitopsInstaller {
    // eslint-disable-next-line class-methods-use-this
    async install(argv) {
        let { httpProxy, httpsProxy } = argv;
        const { kubeConfigPath, provider, argoHost, argoUsername, argoPassword } = argv;

        const binLocation = await downloadProvider({ provider }, bypassDownload);
        const componentRunner = new Runner(binLocation);

        const commands = [
            'install',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }

        const installOptions = _.pick(argv, ['git-integration', 'codefresh-integration', 'argo-token', 'output',
            'update', 'kube-context-name', 'kube-namespace', 'sync-mode', 'sync-apps', 'codefresh-host',
            'codefresh-token', 'codefresh-agent-suffix', 'in-cluster']);
        installOptions['argo-host'] = argoHost;
        installOptions['argo-username'] = argoUsername;
        installOptions['argo-password'] = argoPassword;

        _.forEach(_.pickBy(installOptions, _.identity), (value, key) => {
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
    }
}

module.exports = new GitopsInstaller();
