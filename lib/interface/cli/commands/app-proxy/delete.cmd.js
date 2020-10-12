/* eslint-disable max-len */
const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const inquirer = require('inquirer');
const { selectRuntime, mergeWithValues } = require('./helper');
const colors = require('colors');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    drawCodefreshFiglet,
    unInstallAppProxy,
} = require('./../hybrid/helper');

const openIssueMessage = `If you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

async function promptConfirmationMessage() {
    const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'deletionConfirmed',
        default: false,
        message: 'Are you sure you want to delete the app-proxy-component? (default is NO)',
    });
    if (!answer.deletionConfirmed) {
        console.log('Deletion process aborted, exiting...');
        process.exit(1);
    }
}

const deleteCmd = new Command({
    root: false,
    parent: deleteRoot,
    command: 'delete',
    requiresAuthentication: false,
    description: 'Deletes codefresh runner\'s App-Proxy solution',
    webDocs: {
        category: 'App-Proxy',
        title: 'Install',
        weight: 100,
    },
    // requiresAuthentication: argv => argv && !argv.token,
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context from which the App-Proxy and Runtime should be removed',
        })
        .option('kube-namespace', {
            describe: 'Name of the kubernetes namespace from which the App-Proxy and Runtime should be removed',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('runtime-environment', {
            describe: 'The Codefresh runtime-environment that this App-Proxy will be associated with',
            type: 'string',
        })
        .option('force', {
            describe: 'Run the delete operation without asking to confirm (use with caution!)',
            alias: 'f',
            type: Boolean,
        })
        .option('values', {
            describe: 'specify values in a YAML file',
        })
        .option('set-value', {
            describe: 'Set values for templates, example: --set-value LocalVolumesDir=/mnt/disks/ssd0/codefresh-volumes',
            type: 'array',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (_argv) => {
        const argv = mergeWithValues(_argv);
        const {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'kube-config-path': kubeConfigPath,
            force,
            verbose,
            values,
            'set-value': setValues,
        } = argv;
        let {
            'runtime-environment': runtimeEnvironment,
        } = argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get runtime environments');
        const runtimeNames = runtimes.reduce((acc, re) => {
            if (_.get(re, 'metadata.agent')) {
                acc.push(_.get(re, 'metadata.name'));
            }
            return acc;
        }, []);

        if (_.isEmpty(runtimeNames)) {
            await handleError(
                new Error('no runtime environments found'),
                'Cannot uninstall app-proxy without a Codefresh runtime-environment',
            );
        }

        console.log(colors.green('This uninstaller will guide you through the App-Proxy uninstallation process'));

        if (!runtimeEnvironment || !runtimeNames.find(_.eq.bind(runtimeEnvironment))) {
            if (runtimeEnvironment) {
                console.log(colors.bold(`Runtime-environment "${colors.cyan(runtimeEnvironment)}" `
                    + 'was not found, please choose on of the following:'));
            }
            runtimeEnvironment = await selectRuntime(runtimeNames);
        }

        console.log(`\n${colors.green('Uninstallation options summary:')} 
1. Kubernetes Context: ${colors.cyan(kubeContextName)}
2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
3. Runtime name: ${colors.cyan(runtimeEnvironment)}
`);

        if (!force) {
            await promptConfirmationMessage();
        }

        await unInstallAppProxy({
            kubeConfigPath,
            kubeContextName,
            kubeNamespace,
            verbose,
            valuesFile: values,
            setValue: setValues,

        });
        const re = runtimes.find(runtime => runtimeEnvironment === _.get(runtime, 'metadata.name'));
        const body = {
            appProxy: undefined,
        };

        console.log(`updating runtime-environment ${colors.cyan(runtimeEnvironment)} `);
        await sdk.runtimeEnvs.update({ name: runtimeEnvironment }, _.merge(re, body));

        console.log('Successfully uninstalled App-Proxy');
        console.log(`\nIf you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`);
        await drawCodefreshFiglet();
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = deleteCmd;
