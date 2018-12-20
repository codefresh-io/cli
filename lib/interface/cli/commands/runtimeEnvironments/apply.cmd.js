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
        category: 'Runtime-Environments',
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
        const option = {};
        option.body = argv.filename || {};
        option.name = _.get(option.body, 'metadata.name') || argv.name;
        option.extend = _.get(option.body, 'extends') || argv.extends;
        option.description = _.get(option.body, 'description') || argv.description;
        option.dockerDaemonCluster = _.get(option.body, 'dockerDaemonScheduler.cluster.clusterProvider.selector') || argv.cluster;
        option.dockerDaemonNamespace = _.get(option.body, 'dockerDaemonScheduler.cluster.namespace') || argv.namespace;
        option.runtimeSchedulerCluster = _.get(option.body, 'runtimeScheduler.cluster.clusterProvider.selector') || argv.cluster;
        option.runtimeSchedulerNamespace = _.get(option.body, 'runtimeScheduler.cluster.namespace') || argv.namespace;
        if (!option.name) {
            throw new CFError('Must Provide a runtime environment name');
        }
        if (argv.default) {
            try {
                await runtimeEnvironments.setDefaultForAccount(option.name);
                console.log(`Runtime-Environment: '${option.name}' set as a default.`);
            } catch (err) {
                throw new CFError(err);
            }
        }
        if (!option.extend) {
            throw new CFError('Must specify the runtime you want to extends from');
        }
        if (!option.dockerDaemonCluster || !option.runtimeSchedulerCluster || option.dockerDaemonNamespace || option.runtimeSchedulerNamespace) {
            let extendsFromAccountRe = false;
            _.forEach(argv.extends, (runtime) => {
                if (!runtime.startsWith('system')) {
                    extendsFromAccountRe = true;
                }
            });
            if (!extendsFromAccountRe) {
                throw new CFError('Must Provide cluster name and namespace or extends from existing account runtime environment');
            }
        } if (!argv.filename) {
            if (option.dockerDaemonCluster) {
                _.set(option.body, 'dockerDaemonScheduler.cluster.clusterProvider.selector', option.dockerDaemonCluster);
            }
            if (option.runtimeSchedulerCluster) {
                _.set(option.body, 'runtimeScheduler.cluster.clusterProvider.selector', option.runtimeSchedulerCluster);
            }
            if (option.dockerDaemonNamespace) {
                _.set(option.body, 'dockerDaemonScheduler.cluster.namespace', option.dockerDaemonNamespace);
            }
            if (option.runtimeSchedulerNamespace) {
                _.set(option.body, 'runtimeScheduler.cluster.namespace', option.runtimeSchedulerNamespace);
            }
        }
        await runtimeEnvironments.applyByNameForAccount(option);
        console.log(`Runtime-Environment: '${option.name}' patched.`);
    },
});


module.exports = command;

