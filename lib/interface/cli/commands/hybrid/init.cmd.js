/* eslint-disable max-len */
const Command = require('../../Command');
const hybridRoot = require('../root/hybrid.cmd');
const inquirer = require('inquirer');
const { getAllKubeContexts, getKubeContext } = require('../../helpers/kubernetes');
const installAgent = require('../agent/install.cmd');
const createContext = require('../auth/create-context.cmd');
const getAgents = require('../agent/get.cmd');
const colors = require('colors');
const DEFAULTS = require('../../defaults');

const defaultNamespace = 'codefresh';

const initCmd = new Command({
    root: false,
    parent: hybridRoot,
    command: 'init',
    description: 'Install codefresh hybrid solution\'s components on kubernetes cluster',
    webDocs: {
        category: 'Hybrid',
        title: 'Init',
        weight: 100,
    },
    // requiresAuthentication: argv => argv && !argv.token,
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be created if token is not provided',
        })
        .option('token', {
            describe: 'Registration\'s token',
        })
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL,
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which venona should be installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-node-selector', {
            describe: 'The kubernetes node selector "key=value" to be used by venona build resources (default is no node selector) (string)',
        })
        .option('dry-run', {
            describe: 'Set to true to simulate installation',
        })
        .option('in-cluster', {
            describe: 'Set flag if venona is been installed from inside a cluster',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which venona should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kubernetes-runner-type', {
            describe: 'Set the runner type to kubernetes (alpha feature)',
        })
        .option('tolerations', {
            describe: 'The kubernetes tolerations as path to a  JSON file to be used by venona resources (default is no tolerations) (string)',
        })
        .option('venona-version', {
            describe: 'Version of venona to install (default is the latest)',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('skip-version-check', {
            describe: 'Do not compare current Venona\'s version with latest',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            name, token, url,
        } = argv;
        const {
            'kube-node-selector': kubeNodeSelector,
            'dry-run': dryRun,
            'in-cluster': inCluster,
            'kubernetes-runner-type': kubernetesRunnerType,
            tolerations,
            'venona-version': venonaVersion,
            'kube-config-path': kubeConfigPath,
            'skip-version-check': skipVersionCheck,
            verbose,
        } = argv;
        let {
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
        } = argv;
        const questions = [];
        if (!kubeContextName) {
            const contexts = getAllKubeContexts(kubeConfigPath);
            const currentKubeContext = getKubeContext(kubeConfigPath);

            questions.push({
                type: 'list',
                name: 'context',
                message: 'Select Kubernetes context',
                default: currentKubeContext,
                choices: contexts,
            });
        }
        if (!kubeNamespace) {
            questions.push({
                type: 'input',
                name: 'namespace',
                default: defaultNamespace,
                message: 'Insert Kubernetes namespace (will be created if not exists) ',
                validate: value => (value !== undefined && value !== '') || 'Please enter namespace\'s name',
            });
        }

        questions.push({
            type: 'confirm',
            name: 'shouldMakeDefaultRe',
            default: true,
            message: 'Should mark the hybrid runtime as default runtime ?',

        });

        questions.push({
            type: 'confirm',
            name: 'shouldExecutePipeline',
            default: true,
            message: 'Should execute hello world pipeline ?',

        });

        console.log(colors.green('This installer will guide you through the hybrid installation process'));
        const answers = await inquirer.prompt(questions);
        kubeContextName = kubeContextName || answers.context;
        kubeNamespace = kubeNamespace || answers.namespace;
        const { shouldMakeDefaultRe, shouldExecutePipeline } = answers;
        console.log(colors.green(`Installation options summary : \n Context: ${colors.blue(kubeContextName)} \n Namespace: ${colors.blue(kubeNamespace)} \n Make hybrid runime as default: ${colors.blue(shouldMakeDefaultRe)}\nExecute hello hyrbird pipeline: ${colors.blue(shouldExecutePipeline)}`));
        if (token) { // Add context
            await createContext.handler({
                apiKey: token,
                name: 'hybrid',
                url,
            });
        }
        await installAgent.handler({
            name,
            'kube-context-name': kubeContextName,
            'kube-node-selector': kubeNodeSelector,
            'dry-run': dryRun,
            'in-cluster': inCluster,
            'kube-namespace': kubeNamespace,
            'kubernetes-runner-type': kubernetesRunnerType,
            tolerations,
            'venona-version': venonaVersion,
            'kube-config-path': kubeConfigPath,
            'skip-version-check': skipVersionCheck,
            'install-runtime': true,
            verbose,
            'make-re-as-default': shouldMakeDefaultRe,
            terminateProcess: false,
            createDemoPipeline: true,
            executeDemoPipeline: shouldExecutePipeline,
        });
        console.log('Agent Status:\n');
        await getAgents.handler({});
        console.log(colors.green(`Documenation link:  ${colors.blue('https://codefresh.io/docs/docs/enterprise/codefresh-runner/#codefresh-runner-preview-release')}`));
        process.exit(); // TODO : This is not needed - needed to be fixed
    },
});

module.exports = initCmd;
