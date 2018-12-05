require('debug')('codefresh:cli:get:trigger-event');

const Command = require('../../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../../helpers/get');
const getRoot = require('../../root/get.cmd');

const command = new Command({
    command: 'trigger-events [event-uri]',
    aliases: ['trigger-event'],
    parent: getRoot,
    description: 'Get `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Get Trigger Event',
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: 'trigger-event URI)',
            })
            .option('type', {
                describe: 'trigger-event type',
                default: '',
            })
            .option('kind', {
                describe: 'trigger-event kind',
                default: '',
            })
            .option('filter', {
                describe: 'trigger-event URI filter (regex)',
                default: '',
            })
            .option('public', {
                describe: 'get public trigger-event(s)',
                default: true,
            })
            .example('codefresh get trigger-event registry:dockerhub:codefresh:fortune:push', 'Get DockerHub codefresh/fortune push `trigger-event`')
            .example('codefresh get trigger-event --type registry --kind dockerhub --filter *codefresh', 'Get all DockerHub codefresh/* push `trigger-events`');
    },
    handler: async (argv) => {
        const uri = argv['event-uri'];
        let events;
        if (typeof uri === 'undefined') {
            events = await trigger.getEvents(argv.type, argv.kind, argv.filter, argv.public);
        } else {
            events = await trigger.getEvent(argv['event-uri']);
        }

        if (_.isArray(events)) {
            specifyOutputForArray(argv.output, events, argv.pretty);
        } else {
            specifyOutputForSingle(argv.output, events, argv.pretty);
        }
    },
});

module.exports = command;

