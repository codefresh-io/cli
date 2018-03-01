const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline2 } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    betaCommand: true,
    command: 'pipelines2 [name..]',
    aliases: ['pip2', 'pipeline2'],
    parent: getRoot,
    description: 'Get a specific pipeline or an array of pipelines',
    webDocs: {
        category: 'Pipelines V2',
        title: 'Get Pipeline V2',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Pipeline name',
            });
    },
    handler: async (argv) => {
        const {names, output} = argv;
        let pipelines = [];
        if (!_.isEmpty(names)) {
            for (const name of names) {
                const currPipeline =  await pipeline2.getPipelineByName(name);
                pipelines.push(currPipeline);
            }
        } else {
            pipelines = await pipeline2.getAll();
        }
        specifyOutputForArray(output, pipelines);
    },
});

module.exports = command;

