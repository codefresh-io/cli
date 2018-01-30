const debug = require('debug')('codefresh:cli:get:triggers');
const Command = require('../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');

const command = new Command({
    command: 'triggers <pipeline>',
    aliases: ['t'],
    parent: getRoot,
    description: 'Get pipeline triggers',
    webDocs: {
        category: 'Triggers',
        title: 'Get Pipeline Triggers',
    },
    builder: (yargs) => {
        return yargs
            .positional('pipeline', {
                describe: 'pipeline id',
                require: true,
            });
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const pipeline = argv.pipeline;
        /* eslint-enable prefer-destructuring */

        const triggers = await trigger.getPipelineTriggers(pipeline);

        if (_.isArray(triggers)) {
            specifyOutputForArray(argv.output, triggers);
        } else {
            specifyOutputForSingle(argv.output, triggers);
        }
    },
});

module.exports = command;

