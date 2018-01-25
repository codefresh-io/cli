const debug = require('debug')('codefresh:cli:delete:trigger');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { trigger } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');

const command = new Command({
    command: 'trigger <event-uri> <pipeline>',
    aliases: ['t'],
    parent: deleteRoot,
    cliDocs: {
        description: 'Remove trigger from specified pipeline, this may also remove trigger event w/out pipelines too.',
    },
    webDocs: {
        category: 'Triggers',
        title: 'Remove trigger from specified pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('event-uri', {
                describe: 'trigger event URI',
                required: true,
            })
            .positional('pipeline', {
                describe: 'pipeline ID',
                required: true,
            });
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const eventURI = argv['event-uri'];
        const pipeline = argv.pipeline;
        /* eslint-enable prefer-destructuring */

        await trigger.deletePipelineTrigger(eventURI, pipeline);
        console.log(`Trigger: ${eventURI} has been removed from ${pipeline} pipeline`);
    },
});

module.exports = command;

