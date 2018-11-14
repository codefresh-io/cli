const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic').api;
const applyRoot = require('../root/apply.cmd');


const command = new Command({
    command: 'system-runtime-environments [name]',
    aliases: ['sys-re','system-runtime-environment'],
    parent: applyRoot,
    description: 'apply changes to runtime-environments resource',
    onPremCommand: true,
    usage: 'Use apply to patch an existing context',
    webDocs: {
        category: 'Runtime-Environments (On Prem)',
        title: 'Apply Runtime-Environments',
        weight: 90,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environments name',
            })
            .option('default', {
                describe: 'Set the chosen runtime environment as default',
            })
            .option('extends', {
                describe: 'Set the runtime environments you want to extends from',
                type: Array,
                default: [],
            })
            .option('plan', {
                describe: 'Set the plan of system plan runtime environment',
            })
            .option('description', {
                alias: 'd',
                describe: 'Description of the new runtime environment',
            })
            .example('codefresh patch system-runtime-environments -f ./re.yml', 'Apply changes to a system runtime environment');
    },
    handler: async (argv) => {
        const option = {};
        option.body = argv.filename || {};
        option.name = _.get(option.body, 'metadata.name') || argv.name;
        option.plan = _.get(option.body, 'plan') || argv.plan;
        option.extend = _.get(option.body, 'extends') || argv.extends;
        option.description = _.get(option.body, 'description') || argv.description;
        if (!option.name) {
            throw new CFError('Missing name in metadata');
        }
        if (argv.default) {
            try {
                await runtimeEnvironments.setDefaultForAdmin({
                    name: option.name,
                    plan: option.plan,
                    account: option.account,
                });
                console.log(`Runtime-Environment: '${option.name}' set as a default.`);
            } catch (err) {
                throw (err);
            }
        } else {
            option.type = runtimeEnvironments.getRuntimeEnvironmentType(option.name);
            await runtimeEnvironments.applyByNameForAdmin(option);
            console.log(`Runtime-Environment: '${option.name}' patched.`);
        }
    },
});


module.exports = command;

