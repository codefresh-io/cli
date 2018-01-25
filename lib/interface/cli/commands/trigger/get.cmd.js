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
    cliDocs: {
        description: 'Get triggers connected to the specified pipeline',
    },
    webDocs: {
        category: 'Triggers',
        title: 'Get triggers connected to the specified pipeline',
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

