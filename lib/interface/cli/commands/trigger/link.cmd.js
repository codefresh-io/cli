require('debug')('codefresh:cli:create:trigger');

const Command = require('../../Command');
const { trigger } = require('../../../../logic').api;

const command = new Command({
    root: true,
    command: 'link <event-uri> <pipeline>',
    description: 'Create trigger: link pipeline to `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Define Pipeline Trigger',
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: '`trigger-event` URI',
                require: true,
            })
            .positional('pipeline', {
                describe: 'pipeline to be triggered by the `trigger-event`',
                require: true,
            })
            .example('codefresh link registry:dockerhub:codefresh:fortune:push 5a439664af73ad0001f3ece0', 'Setup trigger by linking 5a43... pipeline to the DockerHub `codefresh/fortune` `push` event');
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const pipeline = argv.pipeline;
        const eventURI = argv['event-uri'];
        /* eslint-enable prefer-destructuring */
        await trigger.createTrigger(eventURI, pipeline);
        console.log(`Trigger: ${eventURI} was successfully linked to the pipeline(s): ${pipeline}`);
    },
});

module.exports = command;

