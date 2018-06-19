require('debug')('codefresh:cli:get:triggers');
const Command = require('../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');

const command = new Command({
    command: 'triggers',
    aliases: ['trigger', 't'],
    parent: getRoot,
    description: 'Get triggers, optionally filtered by pipeline or event',
    webDocs: {
        category: 'Triggers',
        title: 'Get Triggers',
    },
    builder: (yargs) => {
        yargs
            .option('pipeline', {
                describe: 'pipeline id',
            })
            .option('event-uri', {
                describe: 'event URI',
            });
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const pipeline = argv.pipeline;
        const eventURI = argv['event-uri'];
        /* eslint-enable prefer-destructuring */

        let triggers;
        if (pipeline) {
            triggers = await trigger.getPipelineTriggers(pipeline);
        } else if (eventURI) {
            triggers = await trigger.getEventTriggers(eventURI);
        } else {
            triggers = await trigger.getTriggers();
        }

        if (_.isArray(triggers)) {
            specifyOutputForArray(argv.output, triggers);
        } else {
            specifyOutputForSingle(argv.output, triggers);
        }
    },
});

module.exports = command;

