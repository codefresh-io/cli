module.exports = {
    stevedore: {
        name: 'Stevedore',
        description: 'Integrate clusters to Codefresh',
        version: {
            prefix: 'v',
        },
        local: {
            versionFile: 'version.txt',
            dir: 'Stevedore',
            binary: 'stevedore',
            alternateBinary: process.env.STEVEDORE,
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
            versionFile: 'version.txt',
            dir: 'agent',
            binary: 'venona',
            alternateBinary: process.env.VENONACTL,
        },
        remote: {
            versionPath: 'venonactl',
            versionFile: 'VERSION',
            branch: 'release-1.0',
            repo: 'venona',
        },
    },
};
