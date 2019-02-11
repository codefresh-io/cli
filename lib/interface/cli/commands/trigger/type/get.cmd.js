require('debug')('codefresh:cli:get:trigger-types');

const Command = require('../../../Command');
const _ = require('lodash');
const Output = require('../../../../../output/Output');
const getRoot = require('../../root/get.cmd');
const { sdk } = require('../../../../../logic');
const TriggerType = require('../../../../../logic/entities/TriggerType');

const command = new Command({
    command: 'trigger-types',
    aliases: ['trigger-type', 'tt'],
    parent: getRoot,
    description: 'Get a list of available trigger-types',
    webDocs: {
        category: 'Triggers',
        title: 'Get Trigger Types',
    },
    builder: (yargs) => {
        yargs
            .option('type', {
                describe: 'filter by a specific trigger type (e.g. `registry`, `cron`)',
            })
            .option('kind', {
                describe: 'filter by a specific trigger kind (e.g. `dockerhub`, `cfcr`, `gcr`, `acr`); only some `trigger-types` may have kinds',
            })
            .example('codefresh get trigger-types --type registry', 'Get Docker registry trigger types');
    },
    handler: async (argv) => {
        const { type, kind } = argv;

        let types;
        if (type && kind) {
            types = [await sdk.triggers.types.get({ type, kind })];
        } else {
            types = await sdk.triggers.types.list();
            types = _.filter(types, (t) => {
                if (type && kind) {
                    return t.type === type && t.kind === kind;
                } else if (type) {
                    return t.type === type;
                } else if (kind) {
                    return t.kind === kind;
                } else {
                    return true;
                }
            });
        }
        Output.print(types.map(TriggerType.fromResponse));
    },
});

module.exports = command;

