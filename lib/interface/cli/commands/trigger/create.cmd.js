require('debug')('codefresh:cli:create:trigger');

const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { trigger } = require('../../../../logic').api;

const command = new Command({
    command: 'trigger <event-uri> <pipeline>',
    aliases: ['t'],
    parent: createRoot,
    description: 'Create trigger: link pipeline to `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Create Pipeline Trigger',
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
        /* eslint-disable prefer-destructuring */
        const pipeline = argv.pipeline;
        const eventURI = argv['event-uri'];
        /* eslint-enable prefer-destructuring */
        const filters = prepareKeyValueFromCLIEnvOption(argv.filter);
        await trigger.createTrigger(eventURI, pipeline, filters);
        console.log(`Trigger: ${eventURI} was successfully linked to the pipeline: ${pipeline}`);
    },
});

module.exports = command;

