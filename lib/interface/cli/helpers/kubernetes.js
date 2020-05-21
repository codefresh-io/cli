const path = require('path');
const { KubeConfig, Client } = require('kubernetes-client');
const Request = require('kubernetes-client/backends/request');
const _ = require('lodash');

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
const getAllNamespaces = async (kubeconfigPath, kubeContextName) => {
    // eslint-disable-next-line global-require
    const homedir = require('os').homedir();
    const kubePath = kubeconfigPath || process.env.KUBECONFIG || path.join(homedir, '.kube', 'config');
    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromFile(kubePath);
    kubeconfig.setCurrentContext(kubeContextName);
    const backend = new Request({ kubeconfig });
    const client = new Client({ backend, version: 1.13 });
    const resp = await client.api.v1.namespaces.get();
    if (resp.statusCode !== 200) {
        throw new Error(`could not get namespaces from cluster ${kubeContextName}, failed with status: ${resp.statusCode}`);
    }
    const nsObjs = _.get(resp, 'body.items');
    return _.map(nsObjs, ns => _.get(ns, 'metadata.name'));
};

module.exports = {
    getKubeContext,
    getAllKubeContexts,
    getAllNamespaces,
};
