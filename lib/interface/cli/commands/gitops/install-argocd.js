const cp = require('child_process');

async function install({ installManifest, kubeNamespace, loadBalancer }) {
    // sanitizing
    const namespace = kubeNamespace.replace('"', '');
    const manifest = installManifest.replace('"', '');

    try {
        console.log(`Creating namespace ${namespace}...`);
        await cp.execSync(`kubectl create ns "${namespace}"`);
        console.log(`\u2705 Created namespace ${namespace}`);
    } catch (err) {
        if (!err.message.match(/AlreadyExists/)) {
            process.exit(err.status);
        }
    }

    try {
        console.log('Creating argocd resources...');
        await cp.execSync(`kubectl apply -n "${namespace}" -f "${manifest}"`, { stdio: 'inherit' });
        console.log('\u2705 Created argocd resources');
    } catch (err) {
        process.exit(err.status);
    }

    if (loadBalancer) {
        try {
            console.log('Changing service type to "LoadBalancer"...');
            await cp.execSync(
                `kubectl patch svc argocd-server -n "${namespace}" -p '{"spec": {"type": "LoadBalancer"}}'`,
                { stdio: 'inherit' },
            );
            console.log('\u2705 Changed service type to "LoadBalancer"');
        } catch (err) {
            process.exit(err.status);
        }
    }
}

module.exports = {
    install,
};
