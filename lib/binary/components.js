module.exports = {
    stevedore: {
        name: 'Stevedore',
        description: 'Integrate clusters to Codefresh',
        version: {
            prefix: 'v',
        },
        local: {
            versionFile: 'VERSION',
            dir: 'Stevedore',
            binary: 'stevedore',
        },
        remote: {
            versionPath: '/',
            versionFile: 'VERSION',
            branch: 'master',
            repo: 'Stevedore',
        },
    },
    venona: {
        name: 'venona',
        description: 'Install required assets on Kubernetes cluster',
        version: {
            prefix: '',
        },
        local: {
            versionFile: 'VERSION',
            dir: 'agent',
            binary: 'venona',
        },
        remote: {
            versionPath: 'venonactl',
            versionFile: 'VERSION',
            branch: 'release-1.0',
            repo: 'venona',
        },
    },
};
