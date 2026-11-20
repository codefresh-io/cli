const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { homedir } = require('os');

// same context name @kubernetes/client-node assigns when loading config from the service account
const IN_CLUSTER_CONTEXT = 'inClusterContext';

const isInCluster = () => fs.existsSync('/var/run/secrets/kubernetes.io/serviceaccount');

const getKubeContext = (kubeconfigPath) => {
    if (isInCluster()) {
        return IN_CLUSTER_CONTEXT;
    }

    const kubePath = kubeconfigPath || process.env.KUBECONFIG || path.join(homedir(), '.kube', 'config');
    if (!fs.existsSync(kubePath)) {
        throw new Error(`kubeconfig not found at: ${kubePath}, make sure the $KUBECONFIG environment variable is set correctly`);
    }

    const kubeconfig = yaml.load(fs.readFileSync(kubePath, 'utf8'));
    return kubeconfig && kubeconfig['current-context'];
};

module.exports = {
    getKubeContext,
};
