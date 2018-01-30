const debug = require('debug')('codefresh:cli:create:trigger');
const Command = require('../../Command');
const { trigger } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');

const command = new Command({
    command: 'trigger <event-uri> <pipeline> [pipelines...]',
    aliases: ['t'],
    parent: createRoot,
    description: 'Set pipeline(s) trigger: connect the `trigger-event` to the pipeline(s). *Note:* `trigger-event` exists only if there is at least one connected pipeline.',
    webDocs: {
        category: 'Triggers',
        title: 'Set Pipeline Trigger',
    },
    builder: (yargs) => {
        return yargs
            .positional('event-uri', {
                describe: '`trigger-event` URI (as defined by trigger `type[/kind]`)',
                require: true,
            })
            .positional('pipeline', {
                describe: 'pipeline(s) to be triggered by the specified `trigger-event`',
                require: true,
            });
    },
    handler: async (argv) => {
        /* eslint-disable prefer-destructuring */
        const pipelines = [].concat(argv.pipeline).concat(argv.pipelines);
        const eventURI = argv['event-uri'];
        /* eslint-enable prefer-destructuring */
        await trigger.addPipelineTrigger(eventURI, pipelines);
        console.log(`Trigger : ${eventURI} was successfully added to the pipeline(s): ${pipelines}`);
    },
});

module.exports = command;

