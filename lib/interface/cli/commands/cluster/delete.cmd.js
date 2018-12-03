const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const { cluster } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');

const command = new Command({
    command: 'cluster <name>',
    aliases: ['clusters'],
    description: 'Delete a cluster',
    parent: deleteRoot,
    webDocs: {
        category: 'Clusters',
        title: 'Delete Cluster',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Cluster name',
                required: true,
            })
            .example('codefresh delete cluster NAME', 'Delete cluster NAME');
    },
    handler: async (argv) => {
        await cluster.deleteCluster(argv.name);
        console.log(`Cluster: ${argv.name} deleted`);
    },
});

module.exports = command;
