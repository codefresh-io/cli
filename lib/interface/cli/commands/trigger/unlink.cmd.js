require('debug')('codefresh:cli:delete:trigger');

const Command = require('../../Command');
const { trigger } = require('../../../../logic').api;

const command = new Command({
    root: true,
    command: 'unlink <event-uri> <pipeline>',
    description: 'Delete trigger: unlink pipeline from `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Remove Pipeline Trigger',
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
            .example('codefresh unlink registry:dockerhub:codefresh:fortune:push 5a439664af73ad0001f3ece0', 'Remove trigger by unlinking 5a43... pipeline from the DockerHub `codefresh/fortune` `push` event');
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

