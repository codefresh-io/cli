require('debug')('codefresh:cli:create:trigger');

const Command = require('../../Command');
const { trigger } = require('../../../../logic').api;

const command = new Command({
    root: true,
    command: 'link <event-uri> <pipeline> [pipelines...]',
    description: 'Define new trigger(s): link pipeline(s) to the specified `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Define Pipeline Trigger',
        weight: 5,
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: '`trigger-event` URI (as defined by trigger `type[/kind]`)',
                require: true,
            })
            .positional('pipeline', {
                describe: 'pipeline(s) to be triggered by the specified `trigger-event`',
                require: true,
            })
            .example('codefresh link registry:dockerhub:codefresh:fortune:push 5a439664af73ad0001f3ece0', 'Setup trigger by linking 5a43... pipeline to the DockerHub `codefresh/fortune` `push` event');
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const pipelines = [].concat(argv.pipeline).concat(argv.pipelines);
        const event = argv['event-uri'];
        /* eslint-enable prefer-destructuring */
        await trigger.linkPipelinesToEvent(event, pipelines);
        console.log(`Trigger: ${event} was successfully linked to the pipeline(s): ${pipelines}`);
    },
});

module.exports = command;

