require('debug')('codefresh:cli:get:trigger-types');

const Command = require('../../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../../helpers/get');
const getRoot = require('../../root/get.cmd');

const command = new Command({
    root: true,
    command: 'trigger-types [type] [kind]',
    aliases: ['trigger-type'],
    description: 'Get a list of system-wide available `trigger-types` or specified `trigger-type`',
    webDocs: {
        category: 'Triggers',
        title: 'Get Trigger Types',
    },
    builder: (yargs) => {
        yargs
            .positional('type', {
                describe: '`trigger-type` type name (e.g. `registry`, `cron`)',
            })
            .positional('kind', {
                describe: '`trigger-type` kind (e.g. `dockerhub`, `cfcr`, `gcr`, `acr`); only some `trigger-types` may have kinds',
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
        }

        if (_.isArray(types)) {
            specifyOutputForArray(argv.output, types);
        } else {
            specifyOutputForSingle(argv.output, types);
        }
    },
});

module.exports = command;

