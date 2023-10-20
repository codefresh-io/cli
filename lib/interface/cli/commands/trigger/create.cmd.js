require('debug')('codefresh:cli:create:trigger');

const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'trigger [event-uri] [pipeline]',
    aliases: ['t'],
    parent: createRoot,
    description: '[Deprecated] Create trigger: link pipeline to `trigger-event`. Deprecated - please use pipeline spec to manager cron trigger',
    webDocs: {
        category: 'Triggers',
        title: '[Deprecated] Create Pipeline Trigger',
        weight: 5,
    },
    builder: (yargs) => {
        yargs
            .option('filter', {
                describe: 'trigger filter `name=condition` pairs',
                default: [],
            })
            .positional('event-uri', {
                describe: '`trigger-event` URI',
                require: true,
            })
            .positional('pipeline', {
                describe: 'pipeline to be triggered by the `trigger-event`',
                require: true,
            })
            .example('codefresh create trigger registry:dockerhub:codefresh:fortune:push 5a439664af73ad0001f3ece0', 'Create trigger by linking 5a43... pipeline to the DockerHub `codefresh/fortune` `push` event');
    },
    handler: async (argv) => {
        const { 'event-uri': event, pipeline } = argv;

        const filters = prepareKeyValueFromCLIEnvOption(argv.filter);
        await sdk.triggers.create({ event: encodeURIComponent(event), pipeline }, { filters });
        console.log(`Trigger: ${event} was successfully linked to the pipeline: ${pipeline}`);
    },
});

module.exports = command;

