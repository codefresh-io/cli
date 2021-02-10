const fs = require('fs');
const _ = require('lodash');
const YAML = require('yaml');
const gitopsInstaller = require('../common/install');

const valuesMapping = {
    'kube-config-path': 'ConfigPath',
    'kube-context-name': 'Context',
    'kube-namespace': 'Namespace',
    'install-manifest': 'Manifest',

    'codefresh-host': 'CodefreshHost',
    'codefresh-token': 'Token',
    'codefresh-clusters': 'ClustersList',

    'argo-password': 'Password',

    'git-integration': 'Git',
    'git-repo-url': 'Repo',
};

function mergeValuesFromValuesFile(argv, valuesFile) {
    const valuesFileStr = fs.readFileSync(valuesFile, 'utf8');
    const valuesObj = YAML.parse(valuesFileStr);

    Object.keys(valuesMapping)
        .forEach((argvKey) => {
            const valuesKey = valuesMapping[argvKey];
            if (!_.has(argv, argvKey) && _.has(valuesObj, valuesKey)) {
                Object.assign(argv, {
                    [argvKey]: _.get(valuesObj, valuesKey),
                    [_.camelCase(argvKey)]: _.get(valuesObj, valuesKey),
                });
            }
        });
}

class CodefreshInstall {
    // eslint-disable-next-line class-methods-use-this
    async install(argv) {
        const _argv = _.cloneDeep(argv);
        if (argv.values) {
            mergeValuesFromValuesFile(_argv, _argv.values/* , handleError */);
        }
        await gitopsInstaller.install(_argv);
    }
}

module.exports = new CodefreshInstall();
