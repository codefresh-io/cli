require('debug')('codefresh:cli:delete:trigger');

const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { trigger } = require('../../../../logic').api;

const command = new Command({
    command: 'trigger <event-uri> <pipeline>',
    aliases: ['t'],
    parent: deleteRoot,
    description: 'Delete trigger: unlink pipeline from `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Delete Pipeline Trigger',
        weight: 20,
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: '`trigger-event` URI (as defined by trigger `type[/kind]`)',
                required: true,
            })
            .positional('pipeline', {
                describe: 'pipeline ID',
                required: true,
            })
            .example('codefresh delete trigger registry:dockerhub:codefresh:fortune:push 5a439664af73ad0001f3ece0', 'Delete trigger by unlinking 5a43... pipeline from the DockerHub `codefresh/fortune` `push` event');
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const eventURI = argv['event-uri'];
        const pipeline = argv.pipeline;
        /* eslint-enable prefer-destructuring */

        await trigger.deleteTrigger(eventURI, pipeline);
        console.log(`Trigger: ${eventURI} was unlinked from the pipeline: ${pipeline}`);
    },
});

module.exports = command;

