require('debug')('codefresh:cli:get:triggers');
const Command = require('../../Command');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');
const Trigger = require('../../../../logic/entities/Trigger');

const command = new Command({
    command: 'triggers',
    aliases: ['trigger', 't'],
    parent: getRoot,
    description: 'Get triggers, optionally filtered by pipeline or event',
    webDocs: {
        category: 'Triggers',
        title: 'Get Triggers',
    },
    builder: (yargs) => {
        yargs
            .option('pipeline', {
                describe: 'pipeline id',
                alias: 'p',
            })
            .option('event-uri', {
                describe: 'event URI',
                alias: 'e',
            });
    },
    handler: async (argv) => {
        const { 'event-uri': event, pipeline } = argv;

        let triggers;
        if (pipeline) {
            triggers = await sdk.triggers.getPipelineTriggers({ pipeline });
        } else if (event) {
            triggers = await sdk.triggers.getEventTriggers({ event });
        } else {
            triggers = await sdk.triggers.list();
        }

        Output.print(triggers.map(Trigger.fromResponse));
    },
});

module.exports = command;

