const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');
const CFError = require('cf-errors');
const _ = require('lodash');

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
        const clusters = await sdk.clusters.getAll();
        const cluster = _.find(clusters, (curr) => {
            return _.isEqual(curr.selector, argv.name);
        });

        if (!cluster) {
            throw new CFError(`No such cluster: ${argv.name}`);
        }

        await sdk.clusters.delete({ id: cluster._id, provider: cluster.provider });
        console.log(`Cluster: '${argv.name}' deleted`);
    },
});

module.exports = command;
