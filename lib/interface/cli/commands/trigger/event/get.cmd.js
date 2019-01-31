require('debug')('codefresh:cli:get:trigger-event');

const Command = require('../../../Command');
const Output = require('../../../../../output/Output');
const getRoot = require('../../root/get.cmd');
const { sdk } = require('../../../../../logic');
const TriggerEvent = require('../../../../../logic/entities/TriggerEvent');


const command = new Command({
    command: 'trigger-events [event-uri]',
    aliases: ['trigger-event', 'te'],
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
        const { type, kind, filter, public: isPublic } = argv;
        let events;
        if (typeof uri === 'undefined') {
            events = await sdk.triggers.events.getAll({ type, kind, filter, public: isPublic });
        } else {
            events = [await sdk.triggers.events.get({ event: uri })];
        }

        Output.print(events.map(TriggerEvent.fromResponse));
    },
});

module.exports = command;

