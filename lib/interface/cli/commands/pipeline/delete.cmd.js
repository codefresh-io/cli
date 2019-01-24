const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');
const Pipeline = require('../../../../logic/entities/Pipeline');


const command = new Command({
    command: 'pipeline [name]',
    aliases: ['pip'],
    parent: deleteRoot,
    description: 'Delete a pipeline',
    webDocs: {
        category: 'Pipelines',
        title: 'Delete Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Pipeline name',
            });
    },
    handler: async (argv) => {
        const { name } = argv;

        await sdk.pipelines.delete({ name });
        console.log(`Pipeline '${name}' deleted.`);
    },
});


module.exports = command;

