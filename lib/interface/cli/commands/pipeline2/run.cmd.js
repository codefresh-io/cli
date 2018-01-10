const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline2 } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const runRoot = require('../workflow/run.cmd');


const command = new Command({
    betaCommand: true,
    command: 'pipeline2 [name]',
    description: 'Runs a pipeline',
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Pipeline name',
            });
    },
    handler: async (argv) => {
        const {name, output} = argv;

        const buildId = await pipeline2.runPipelineByName(name);
        console.log(`New build created for pipeline '${name}': ${buildId}`);
    },
});
runRoot.subCommand(command);


module.exports = command;

