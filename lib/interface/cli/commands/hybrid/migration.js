async function migrate({ kubeContext, kubeNamespace, agentName }) {
    console.log('migrating...');
}

async function upgrade({ kubeContext, kubeNamespace, agentName }) {
    console.log('upgrading...');
}
module.exports = {
    migrate,
    upgrade,
};
