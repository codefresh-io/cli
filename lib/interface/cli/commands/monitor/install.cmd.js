/* eslint-disable max-len */
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { sdk } = require('../../../../logic');
const { DefaultLogFormatter } = require('./../hybrid/helper');
const { downloadVeonona } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');

const installMonitorCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'monitor',
    description: 'Install and create an cluster resources monitor on kubernetes cluster',
    webDocs: {
        category: 'Monitor',
        title: 'Install',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('cluster-id', {
            describe: 'Cluster id - freestyle name',
        })
        .option('token', {
            describe: 'Codefresh user token',
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which monitor should be installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('url', {
            describe: 'Codefresh url, by default https://g.codefresh.io',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which monitor should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('docker-registry', {
            describe: 'The prefix for the container registry that will be used for pulling the required components images. Example: --docker-registry="docker.io"',
            type: 'string',
        })
        .option('values', {
            describe: 'specify values in a YAML file',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            url,
            //     'kube-config-path': kubeConfigPath,
            'cluster-id': clusterId,
            token,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'docker-registry': dockerRegistry,
            verbose,
            values: valuesFile,
            //        noExit,
        } = argv;
        const binLocation = await downloadVeonona();
        const componentRunner = new Runner(binLocation);

        const commands = [
            'install',
            'monitor',
        ];

        if (clusterId) {
            commands.push('--clusterId');
            commands.push(clusterId);
        }

        if (token) {
            commands.push('--codefreshToken');
            commands.push(token);
        }

        if (kubeContextName) {
            commands.push('--kube-context-name');
            commands.push(kubeContextName);
        }

        // if (helm3) {
        //     commands.push('--helm3');
        // }

        if (kubeNamespace) {
            commands.push('--kube-namespace');
            commands.push(kubeNamespace);
        }

        if (url) {
            commands.push('--codefreshHost');
            commands.push(url);
        }
        if (verbose) {
            commands.push('--verbose');
        }
        if (DefaultLogFormatter) {
            commands.push(`--log-formtter=${DefaultLogFormatter}`);
        }

        if (dockerRegistry) {
            commands.push(`--docker-registry=${dockerRegistry}`);
        }
        if (valuesFile) {
            commands.push(`--values=${valuesFile}`);
        }

        await componentRunner.run(components.venona, commands);
    },
});

module.exports = installMonitorCmd;
