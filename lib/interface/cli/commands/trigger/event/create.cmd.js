require('debug')('codefresh:cli:create:trigger-event');

const Command = require('../../../Command');
const { trigger } = require('../../../../../logic').api;
const { prepareKeyValueFromCLIEnvOption } = require('../../../helpers/general');
const createRoot = require('../../root/create.cmd');

const command = new Command({
    command: 'trigger-event',
    parent: createRoot,
    description: 'Create new `trigger-event`',
    webDocs: {
        category: 'Triggers',
        title: 'Create Trigger Event',
    },
    builder: (yargs) => {
        yargs
            .option('type', {
                describe: 'trigger-event type',
                require: true,
            })
            .option('kind', {
                describe: 'trigger-event kind',
            })
            .option('public', {
                describe: 'wether trigger-event is public (system-wide): can be linked to any pipeline in any account',
                default: false,
            })
            .option('secret', {
                describe: 'trigger-event secret (omit to auto-generate)',
                require: true,
                default: '!generate',
            })
            .option('value', {
                describe: 'trigger-event specific values pairs (key=value), as required by trigger-type',
                default: [],
            })
            .option('context', {
                describe: 'context with credentials required to setup event on remote system',
            })
            .example('codefresh create trigger-event --type registry --kind dockerhub --secret XYZ1234 --value namespace=codefresh --value name=fortune --context dockerhub', 'Create registry/dockerhub trigger-event')
            .example('codefresh create trigger-event --type cron --kind codefresh --secret XYZ1234 --value expression="0 0 */1 * * *" --value message=hello', 'Create cron (once in hour) trigger-event')
            .example('codefresh create trigger-event --type cron --kind codefresh --secret XYZ1234 --value expression="@daily" --value message=hello-all', 'Create public daily cron trigger-event');
    },
    handler: async (argv) => {
        const values = prepareKeyValueFromCLIEnvOption(argv.value);
        const uri = await trigger.createEvent(argv.type, argv.kind, argv.public, argv.secret, values, argv.context);
        console.log(`Trigger event: ${uri} was successfully created.`);
    },
});

module.exports = command;

