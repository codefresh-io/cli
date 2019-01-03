const Command = require('../../Command');
const _ = require('lodash');
const { environment } = require('../../../../logic').api;
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const Promise = require('bluebird');

const command = new Command({
    command: 'environments [id..]',
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
        const environmentIds = argv.id;

        let environments = [];
        // TODO:need to decide for one way for error handeling
        if (!_.isEmpty(environmentIds)) {
            environments = await Promise.map(environments, id => environment.getEnvironmentById(id));
        } else {
            environments = await environment.getEnvironments();
        }
        Output.print(environments);
    },
});

module.exports = command;

