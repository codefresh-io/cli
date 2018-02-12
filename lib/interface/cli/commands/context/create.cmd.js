const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption, crudFilenameOption } = require('../../helpers/general');
const { context } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');
const yargs = require('yargs');

const command = new Command({
    command: 'context',
    aliases: ['ctx'],
    parent: createRoot,
    description: 'Create a context',
    webDocs: {
        category: 'Contexts',
        title: 'Create Context',
    },
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        yargs.showHelp();
    },
});

module.exports = command;

