const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline2 } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    command: 'pipeline2 [name]',
    description: 'Deletes a pipeline',
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
deleteRoot.subCommand(command);


module.exports = command;

