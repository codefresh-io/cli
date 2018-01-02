const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline2 } = require('../../../../logic').api;
const describeRoot = require('../root/describe.cmd');

const command = new Command({
    command: 'pipeline2 <name>',
    description: 'describe pipeline',
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'pipeline name',
            });
    },
    handler: async (argv) => {
        const { name } = argv;

        const pipeline = await pipeline2.getPipelineByName(name);
        
        console.log(pipeline.describe());
    },
});
describeRoot.subCommand(command);


module.exports = command;

