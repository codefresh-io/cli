const Command = require('../../Command');

const install = new Command({
    root: true,
    command: 'install',
    description: 'Install or upgrade Helm chart',
    builder: (yargs) => {
        return yargs
            .usage('Install or upgrade helm chart on cluster')
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = install;
