const debug = require('debug')('codefresh:cli:get:trigger-types');
const Command = require('../../../Command');
const _ = require('lodash');
const { trigger } = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../../helpers/get');
const getRoot = require('../../root/get.cmd');

const command = new Command({
    command: 'trigger-types [type] [kind]',
    aliases: ['tt'],
    parent: getRoot,
    cliDocs: {
        description: 'Get list of trigger types or individual trigger installed in Codefresh environment',
    },
    webDocs: {
        category: 'Triggers',
        title: 'Get available trigger type/s',
    },
    builder: (yargs) => {
        return yargs
            .positional('type', {
                describe: '[optional] trigger type (e.g. registry, cron)',
            })
            .positional('kind', {
                describe: '[optional] trigger kind (e.g. dockerhub, cfcr, gcr, acr)',
            });
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

