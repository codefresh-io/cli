const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline2 } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'pipelines [name]',
    aliases: ['pip', 'pipeline'],
    parent: getRoot,
    description: 'Get a specific pipeline or an array of pipelines',
    webDocs: {
        category: 'Pipelines',
        title: 'Get Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Pipeline name',
            });
    },
    handler: async (argv) => {
        const {name, output} = argv;

        if (name) {
            specifyOutputForSingle(output, await pipeline2.getPipelineByName(name));
        } else {
            specifyOutputForArray(output, await pipeline2.getAll());
        }
    },
});

module.exports = command;

