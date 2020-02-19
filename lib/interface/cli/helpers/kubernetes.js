const path = require('path');
const { KubeConfig } = require('kubernetes-client');

const getKubeContext = () => {
    // eslint-disable-next-line global-require
    const homedir = require('os').homedir();
    const kubePath = path.join(homedir, '.kube', 'config');
    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromFile(kubePath);
    return kubeconfig.currentContext;
};
module.exports = {
    getKubeContext,
};
