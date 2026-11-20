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
};
