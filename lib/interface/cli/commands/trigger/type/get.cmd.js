require('debug')('codefresh:cli:get:trigger-types');

const Command = require('../../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../../helpers/get');
const getRoot = require('../../root/get.cmd');

const command = new Command({
    command: 'trigger-types',
    aliases: ['trigger-type'],
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
        /* eslint-disable prefer-destructuring */
        const type = argv.type;
        const kind = argv.kind;
        /* eslint-enable prefer-destructuring */

        let types;
        if (type && kind) {
            types = await trigger.getType(type, kind);
        } else {
            types = await trigger.getAllTypes();
            types = _.filter(types, (t) => {
                if (type && kind) {
                    return t.info.type === type && t.info.kind === kind;
                } else if (type) {
                    return t.info.type === type;
                } else if (kind) {
                    return t.info.kind === kind;
                } else {
                    return true;
                }
            });
        }

        if (_.isArray(types)) {
            specifyOutputForArray(argv.output, types, argv.pretty);
        } else {
            specifyOutputForSingle(argv.output, types, argv.pretty);
        }
    },
});

module.exports = command;

