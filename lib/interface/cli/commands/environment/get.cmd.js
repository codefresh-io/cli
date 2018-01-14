const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { environment } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'environments [id]',
    aliases: ['env', 'environment'],
    description: 'Get environments',
    category: 'Environments',
    parent: getRoot,
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'environment id or name',
            });
    },
    handler: async (argv) => {
        const environmentId = argv.id;

        let environments;
        // TODO:need to decide for one way for error handeling
        if (environmentId) {
            environments = await environment.getEnvironmentById(environmentId);
            specifyOutputForSingle(argv.output, environments);
        } else {
            environments = await environment.getEnvironments();
            specifyOutputForArray(argv.output, environments);
        }
    },
});

module.exports = command;

