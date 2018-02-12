require('debug')('codefresh:cli:get:trigger-event');

const Command = require('../../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../../helpers/get');
const getRoot = require('../../root/get.cmd');

const command = new Command({
    command: 'trigger-event <event-uri>',
    parent: getRoot,
    description: 'Get `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Get Trigger Event',
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: '`trigger-event` URI (as defined by trigger `type[/kind]`)',
                require: true,
            })
            .example('codefresh get trigger-event registry:dockerhub:codefresh:fortune:push', 'Get DockerHub codefresh/fortune push `trigger-event`');
    },
    handler: async (argv) => {
        const event = await trigger.getEvent(argv['event-uri']);

        if (_.isArray(event)) {
            specifyOutputForArray(argv.output, event);
        } else {
            specifyOutputForSingle(argv.output, event);
        }
    },
});

module.exports = command;

