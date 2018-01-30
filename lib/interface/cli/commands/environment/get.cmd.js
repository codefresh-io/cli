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
    category: 'Environments',
    parent: getRoot,
    description: 'Get a specific environment or an array of environments',
    usage: 'Passing [id] argument will cause a retrieval of a specific environment.\n In case of not passing [id] argument, a list will be returned',
    webDocs: {
        category: 'Environments',
        title: 'Get Environment',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'environment id or name',
            })
            .example('codefresh get environment ID', 'Get environment ID')
            .example('codefresh get environments', 'Get all environments');
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

