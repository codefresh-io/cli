const debug = require('debug')('codefresh:cli:get:cluster');
const Command = require('../../Command');
const { cluster } = require('../../../../logic').api;
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');


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
        const clusters = await cluster.getAllClusters();
        Output.print(clusters);
    },
});

module.exports = command;

