const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline2 } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    betaCommand: true,
    command: 'pipeline2 [name]',
    aliases: ['pip2'],
    parent: deleteRoot,
    cliDocs: {
        description: 'Delete a pipeline',
    },
    webDocs: {
        category: 'Pipelines V2',
        title: 'Delete a pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Pipeline name',
            });
    },
    handler: async (argv) => {
        const {name} = argv;

        await pipeline2.deletePipelineByName(name);
        console.log(`Pipeline '${name}' deleted.`);
    },
});


module.exports = command;

