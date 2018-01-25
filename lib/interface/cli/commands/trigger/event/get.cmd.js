const debug = require('debug')('codefresh:cli:get:trigger-event');
const Command = require('../../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../../helpers/get');
const getRoot = require('../../root/get.cmd');

const command = new Command({
    command: 'trigger-event <event-uri>',
    aliases: ['te', 'event'],
    parent: getRoot,
    cliDocs: {
        description: 'Get detailed information about specified trigger event',
    },
    webDocs: {
        category: 'Triggers',
        title: 'Get detailed information about trigger event',
    },
    builder: (yargs) => {
        return yargs
            .positional('event-uri', {
                describe: 'trigger event uri (as defined by trigger type/kind)',
                require: true,
            });
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const eventURI = argv['event-uri'];
        /* eslint-enable prefer-destructuring */

        const info = await trigger.getEventInfo(eventURI);

        if (_.isArray(info)) {
            specifyOutputForArray(argv.output, info);
        } else {
            specifyOutputForSingle(argv.output, info);
        }
    },
});

module.exports = command;

