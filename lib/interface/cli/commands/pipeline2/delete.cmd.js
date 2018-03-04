const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline2: pipeline } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    command: 'pipeline-v2 [name]',
    aliases: ['pip-v2'],
    parent: deleteRoot,
    description: 'Delete a pipeline',
    webDocs: {
        category: 'Pipelines V2 (beta)',
        title: 'Delete Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Pipeline name',
            });
    },
    handler: async (argv) => {
        const {name} = argv;

        await pipeline.deletePipelineByName(name);
        console.log(`Pipeline '${name}' deleted.`);
    },
});


module.exports = command;

