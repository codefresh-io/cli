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
            .option('request-cpu', {
                alias: 'rc',
                describe: 'Set the request cpu',
            })
            .option('request-memory', {
                alias: 'rm',
                describe: 'Set the request memory',
            })
            .option('limits-cpu', {
                alias: 'lc',
                describe: 'Set the limits cpu',
            })
            .option('limits-memory', {
                alias: 'lm',
                describe: 'Set the limits memory',
            })
            .example('codefresh patch system-runtime-environments -f ./re.yml', 'Apply changes to a system-runtime-environment');
    },
    handler: async (argv) => {
        const option = {};
        if (argv.filename) {
            option.body = argv.filename;
            option.name = _.get(option.body, 'metadata.name');
            option.plan = _.get(option.body, 'plan');
            option.extend = _.get(option.body, 'extends');
            if (!option.name) {
                throw new CFError('Missing name in metadata');
            }
        } else {
            option.name = argv.name;
            option.plan = argv.plan;
            option.extend = argv.extends;
            if (argv.default) {
                try {
                    await runtimeEnvironments.setDefaultForAdmin({
                        name: option.name,
                        plan: option.plan,
                    });
                } catch (err) {
                    throw (err);
                }
            }
            option.body = {
                runtimeScheduler: {
                    resources: {
                        requests: {
                            cpu: argv['request-cpu'],
                            memory: argv['request-memory'],
                        },
                        limits: {
                            cpu: argv['limits-cpu'],
                            memory: argv['limits-cpu'],
                        },
                    },
                },
            };
        }
        option.type = runtimeEnvironments.getRuntimeEnvironmentType(option.name);
        await runtimeEnvironments.applyByNameForAdmin(option);
        console.log(`Runtime-Environment '${option.name}' patched.`);
    },
});


module.exports = command;

