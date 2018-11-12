const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic').api;
const applyRoot = require('../root/apply.cmd');


const command = new Command({
    command: 'runtime-environments [name]',
    aliases: ['re','runtime-environment'],
    parent: applyRoot,
    description: 'apply changes to runtime-environments resource',
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
            })
            .option('namespace', {
                alias: 'ns',
                describe: 'Set the desire namespace',
            })
            .option('cluster', {
                alias: 'c',
                describe: 'Set the desire cluster',
            })
            .option('description', {
                alias: 'd',
                describe: 'Description of the new runtime environment',
            })
            .example('codefresh patch runtime-environments -f ./re.yml', 'Apply changes to a runtime-environment');
    },
    handler: async (argv) => {
        if (argv.filename) {
            const data = argv.filename;
            const valid = _.has(data, ['metadata.name', 'runtimeScheduler.cluster.clusterProvider.selector',
                'runtimeScheduler.cluster.namespace', 'dockerDaemonScheduler.cluster.clusterProvider.selector',
                'dockerDaemonScheduler.cluster.namespace', 'extends'],
            );
            if (!valid) {
                throw new CFError('Missing parameters');
            }
        } else {
            const name = argv.name;
            const description = argv.description;
            if (!name) {
                throw new CFError('Must Provide a runtime environment name');
            }
            if (argv.default) {
                try {
                    await runtimeEnvironments.setDefaultForAccount(name);
                    console.log(`Runtime-Environment: '${name}' set as a default.`);
                } catch (err) {
                    throw (err);
                }
            } else {
                if (!argv.extends) {
                    throw new CFError('Must specify the runtime you want to extends from');
                }
                if (!argv.cluster || !argv.namespace) {
                    let extendsFromAccountRe = false;
                    _.forEach(argv.extends, (runtime) => {
                        if (!runtime.startsWith('system')) {
                            extendsFromAccountRe = true;
                        }
                    });
                    if (!extendsFromAccountRe) {
                        throw new CFError('Must Provide cluster name and namespace or extends from existing account runtime environment');
                    }
                }
                const extend = argv.extends;
                let body = {};
                if (argv.cluster && argv.namespace) {
                    body = {
                        runtimeScheduler: {
                            cluster: {
                                clusterProvider: {
                                    selector: argv.cluster,
                                },
                                namespace: argv.namespace,
                            },
                        },
                        dockerDaemonScheduler: {
                            cluster: {
                                clusterProvider: {
                                    selector: argv.cluster,
                                },
                                namespace: argv.namespace,
                            },
                        },
                    };
                }
                await runtimeEnvironments.applyByNameForAccount({
                    name,
                    extend,
                    description,
                    body,
                });
                console.log(`Runtime-Environment: '${name}' patched.`);
            }
        }
    },
});


module.exports = command;

