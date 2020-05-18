/* eslint-disable max-len */
const Command = require('../../Command');
const runnerRoot = require('../root/runner.cmd');
const inquirer = require('inquirer');
const { getAllKubeContexts, getKubeContext } = require('../../helpers/kubernetes');
const unInstallRuntime = require('../runtimeEnvironments/uninstall.cmd');
const unInstallAgent = require('../agent/uninstall.cmd');
const unInstallMonitor = require('../monitor/uninstall.cmd');
const colors = require('colors');
const DEFAULTS = require('../../defaults');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');

const defaultNamespace = 'codefresh';

const deleteCmd = new Command({
    root: false,
    parent: runnerRoot,
    command: 'delete',
    requiresAuthentication: false,
    description: 'Deletes codefresh runner solution\'s components on kubernetes cluster',
    webDocs: {
        category: 'Runner',
        title: 'Delete',
        weight: 100,
    },
    // requiresAuthentication: argv => argv && !argv.token,
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be deleted',
        })
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL,
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which venona should be installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which venona should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            'kube-config-path': kubeConfigPath,
        } = argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            name: agentName,
        } = argv;

        const questions = [];
        if (!kubeContextName) {
            const contexts = getAllKubeContexts(kubeConfigPath);
            const currentKubeContext = getKubeContext(kubeConfigPath);

            questions.push({
                type: 'list',
                name: 'context',
                message: 'Name of Kubernetes context to use',
                default: currentKubeContext,
                choices: contexts,
            });
        }
        if (!kubeNamespace) {
            questions.push({
                type: 'input',
                name: 'namespace',
                default: defaultNamespace,
                message: 'Kubernetes namespace to remove Codefresh Runner components from ',
                validate: value => (value !== undefined && value !== '') || 'Please enter namespace\'s name',
            });
        }
        const agents = await sdk.agents.list({});
        if (!agentName) {
            questions.push({
                type: 'list',
                name: 'name',
                message: 'Agent name to uninstall',
                choices: agents,
            });
        }
        console.log(colors.green('This uninstaller will guide you through the runner uninstallation process'));
        const answers = await inquirer.prompt(questions);
        kubeContextName = kubeContextName || answers.context;
        kubeNamespace = kubeNamespace || answers.namespace;
        agentName = agentName || answers.name;
        // check that agent exists
        const agent = _.find(agents, curr => curr.name === agentName);
        if (!agent) {
            console.log(colors.red(`Agent with name ${agentName} doesn\'t exists`));
            return;
        }
        if (agent.runtimes && agent.runtimes > 1) {
            console.log('Can\'t delete runner with more than one runtime , use runtime delete command');
            return;
        }
        console.log(colors.green(`Uninstallation options summary : \n Context: ${colors.blue(kubeContextName)} \n Namespace: ${colors.blue(kubeNamespace)} \n Agent name: ${colors.blue(agentName)} `));
        if (agent.runtimes.length === 1) {
            await unInstallRuntime.handler({
                'agent-name': agentName,
                'runtime-kube-namespace': kubeNamespace,
                'runtime-kube-context-name': kubeContextName,
                'agent-kube-context-name': kubeContextName,
                'agent-kube-namespace': kubeNamespace,
                name: agent.runtimes[0],
                terminateProcess: false,
            });
        }
        await unInstallAgent.handler({
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            name: agentName,
            terminateProcess: false,
        });
        await unInstallMonitor.handler({
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            noExit: true, // to prevent if from calling: process.exit()

        });
        console.log('Successfully uninstalled Codefresh Runner');
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = deleteCmd;
