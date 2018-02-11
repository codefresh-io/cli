require('debug')('codefresh:cli:delete:trigger-event');

const Command = require('../../../Command');
const { trigger } = require('../../../../../logic').api;
const deleteRoot = require('../../root/delete.cmd');

const command = new Command({
    command: 'trigger-event [event-uri]',
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
        await trigger.deleteEvent(argv['event-uri'], argv.context);
        console.log(`Trigger event: ${argv['event-uri']} was successfully deleted.`);
    },
});

module.exports = command;

