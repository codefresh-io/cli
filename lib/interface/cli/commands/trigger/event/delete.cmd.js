require('debug')('codefresh:cli:delete:trigger-event');

const Command = require('../../../Command');
const deleteRoot = require('../../root/delete.cmd');
const { sdk } = require('../../../../../logic');

const command = new Command({
    command: 'trigger-event [event-uri]',
    aliases: ['te'],
    parent: deleteRoot,
    description: 'Delete `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Delete Trigger Event',
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: 'trigger-event URI',
            })
            .option('context', {
                describe: 'context with credentials required to setup event on remote system',
            })
            .example('codefresh delete trigger-event --context dockerhub registry:dockerhub:codefresh:fortune:push', 'Delete registry/dockerhub trigger-event');
    },
    handler: async (argv) => {
        const { 'event-uri': event, context } = argv;
        await sdk.triggers.events.delete({ event, context });
        console.log(`Trigger event: ${argv['event-uri']} was successfully deleted.`);
    },
});

module.exports = command;

