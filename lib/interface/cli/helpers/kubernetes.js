const path = require('path');
const fs = require('fs');
const { KubeConfig, Client } = require('kubernetes-client');
const Request = require('kubernetes-client/backends/request');
const _ = require('lodash');
const { homedir } = require('os');

const isInCluster = () => fs.existsSync('/var/run/secrets/kubernetes.io/serviceaccount');

const _getKubeConfig = (kubeconfigPath) => {
    const kc = new KubeConfig();
    if (isInCluster()) {
        kc.loadFromCluster();
        return kc;
    }

    const kubePath = kubeconfigPath || process.env.KUBECONFIG || path.join(homedir(), '.kube', 'config');
    if (!fs.existsSync(kubePath)) {
        throw new Error(`kubeconfig not found at: ${kubePath}, make sure the $KUBECONFIG environment variable is set correctly`);
    }

    kc.loadFromFile(kubePath);

    return kc;
};


const getKubeContext = (kubeconfigPath) => {
    const kubeconfig = _getKubeConfig(kubeconfigPath);
    return kubeconfig.currentContext;
};
const getAllKubeContexts = (kubeconfigPath) => {
    const kubeconfig = _getKubeConfig(kubeconfigPath);
    const { contexts } = kubeconfig;
    if (contexts) {
        return contexts.reduce((acc, curr) => {
            acc.push(curr.name);
            return acc;
        }, []);
    }
    return [];
};
const getAllNamespaces = async (kubeconfigPath, kubeContextName) => {
    const kubeconfig = _getKubeConfig(kubeconfigPath);
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
    isInCluster,
};
