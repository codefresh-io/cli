const _ = require('lodash');
const Command = require('../../Command');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');
const Cluster = require('../../../../logic/entities/Cluster');


const command = new Command({
    command: 'clusters',
    aliases: ['cluster'],
    category: 'Clusters',
    parent: getRoot,
    description: 'Get an array of clusters',
    webDocs: {
        category: 'Clusters',
        title: 'Get Clusters',
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh get clusters', 'Get all clusters');
    },
    handler: async (argv) => {
        const clusters = await sdk.clusters.list();
        Output.print(_.map(clusters, Cluster.fromResponse));
    },
});

module.exports = command;

