require('debug')('codefresh:cli:create:trigger-event');

const Command = require('../../../Command');
const { prepareKeyValueFromCLIEnvOption } = require('../../../helpers/general');
const createRoot = require('../../root/create.cmd');
const { sdk } = require('../../../../../logic');

const command = new Command({
    command: 'trigger-event',
    aliases: ['te'],
    parent: createRoot,
    description: '[Deprecated] Create new `trigger-event`. Deprecated - please use pipeline spec to manager cron trigger',
    webDocs: {
        category: 'Triggers',
        title: '[Deprecated] Create Trigger Event',
    },
    builder: (yargs) => {
        yargs
            .option('type', {
                describe: 'trigger-event type',
                required: true,
            })
            .option('kind', {
                describe: 'trigger-event kind',
                required: true,
            })
            .option('public', {
                describe: 'wether trigger-event is public (system-wide): can be linked to any pipeline in any account',
                default: false,
                type: 'boolean',
            })
            .option('secret', {
                describe: 'trigger-event secret (omit to auto-generate)',
                required: true,
                default: '!generate',
            })
            .option('value', {
                describe: 'trigger-event specific values pairs (key=value), as required by trigger-type',
                alias: 'v',
                default: [],
                array: true,
            })
            .option('context', {
                describe: 'context with credentials required to setup event on remote system',
            })
            .example('codefresh create trigger-event --type registry --kind dockerhub --value namespace=codefresh --value name=fortune --value action=push', 'Create registry/dockerhub trigger-event')
            .example('codefresh create trigger-event --type cron --kind codefresh --value expression="0 0 */1 * * *" --value message=hello', 'Create cron (once in hour) trigger-event')
            .example('codefresh create trigger-event --type cron --kind codefresh --value expression="@daily" --value message=hello-all', 'Create daily cron trigger-event');

    },
    handler: async (argv) => {
        const values = prepareKeyValueFromCLIEnvOption(argv.value);
        const { type, kind, secret, context, public: pub } = argv;
        const uri = await sdk.triggers.events.create({ public: pub }, { type, kind, secret, context, values });
        console.log(`Trigger event: ${uri} was successfully created.`);
    },
});

module.exports = command;

