const _ = require('lodash');
const debug = require('debug')('codefresh:cli:create:context:git:github');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const createbase = require('./../create.cmd');
const {
    registry,
} = require('../../../../../logic/index').api;

const command = new Command({
    command: 'standard <name>',
    parent: createbase,
    description: 'Integrate a standard container registry into Codefresh',
    webDocs: {
        category: 'Registries',
        title: 'Standard',
        subCategory: 'standard',
        weight: 10,
    },
    builder: (yargs) => {
        yargs
            .positional('name', {
                describe: 'Registry name',
            })
            .option('username', {
                describe: 'Username to access the docker registry',
                required: true,
            })
            .option('password', {
                describe: 'Password to access the docker registry',
                required: true,
            })
            .option('domain', {
                describe: 'Domain to access the docker registry',
                required: true,
            })
            .option('behind-firewall', {
                describe: 'Set if the registry is behind a firewall',
                default: false,
                type: 'boolean',
            });
        return yargs;
    },
    handler: async (argv) => {
        const data = _.chain(argv)
            .pick(['username', 'password', 'domain', 'name', 'behindFirewall'])
            .merge({ provider: 'other' })
            .value();
        await registry.create(data);
    },
});

module.exports = command;
