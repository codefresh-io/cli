const path = require('path');
const { KubeConfig } = require('kubernetes-client');

const getKubeContext = (kubeconfigPath) => {
    // eslint-disable-next-line global-require
    const homedir = require('os').homedir();
    const kubePath = kubeconfigPath || process.env.KUBECONFIG || path.join(homedir, '.kube', 'config');
    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromFile(kubePath);
    return kubeconfig.currentContext;
};
const getAllKubeContexts = (kubeconfigPath) => {
    // eslint-disable-next-line global-require
    const homedir = require('os').homedir();
    const kubePath = kubeconfigPath || process.env.KUBECONFIG || path.join(homedir, '.kube', 'config');
    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromFile(kubePath);
    const { contexts } = kubeconfig;
    if (contexts) {
        return contexts.reduce((acc, curr) => {
            acc.push(curr.name);
            return acc;
        }, []);
    }
};

module.exports = {
    getKubeContext,
    getAllKubeContexts,
};
