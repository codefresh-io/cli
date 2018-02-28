require('debug')('codefresh:cli:delete:trigger');

const Command = require('../../Command');
const { trigger } = require('../../../../logic').api;

const command = new Command({
    root: true,
    command: 'unlink <event-uri> <pipeline> [pipelines...]',
    description: 'Undefine trigger(s): unlink pipeline(s) from the specified `trigger-event`',
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
        const event = argv['event-uri'];
        const pipelines = [].concat(argv.pipeline).concat(argv.pipelines);
        /* eslint-enable prefer-destructuring */

        await trigger.unlinkPipelinesFromEvent(event, pipelines);
        console.log(`Trigger: ${eventURI} was unlinked from the pipeline(s): ${pipelines}`);
    },
});

module.exports = command;

