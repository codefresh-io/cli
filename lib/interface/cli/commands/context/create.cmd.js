const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption, crudFilenameOption } = require('../../helpers/general');
const { context } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');

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
        throw new CFError('Please insert a valid command : create context secret/config/yaml/yaml-secret/helm-repository');
    },
});

module.exports = command;

