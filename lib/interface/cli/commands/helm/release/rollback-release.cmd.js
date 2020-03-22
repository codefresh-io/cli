const Command = require('../../../Command');
const { sdk } = require('../../../../../logic');
const { followLogs } = require('../../../helpers/logs');
const Output = require('../../../../../output/Output');
const helmUtil = require('./util');

const rollback = new Command({
    root: true,
    command: 'rollback-release <name>',
    description: 'Rollback a helm release from a kubernetes cluster',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Rollback Helm Release',
        weight: 10,
    },
    builder: (yargs) => {
        return yargs
            .option('cluster', {
                description: 'Run on cluster',
                type: 'string',
                required: true,
                alias: 'c',
            })
            .option('revision', {
                description: 'revision number',
                type: 'number',
                alias: 't',
                required: true,
            })
            .option('tiller-namespace', {
                description: 'prevent hooks from running during deletion',
                type: 'string',
                alias: 'n',
                default: 'kube-system',
            })
            .option('namespace', {
                description: 'prevent hooks from running during deletion',
                type: 'string',
                alias: 'ns',
                default: 'default',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .example('codefresh rollback my-release --cluster my-cluster --revision 1',
                'rollback release "my-release" from cluster "my-cluster"');
    },
    handler: async (argv) => {
        const {
            name: releaseName,
            revision,
            cluster: selector,
            tillerNamespace,
            namespace,
        } = argv;

        if (!releaseName) {
            throw new Error('Release name is required');
        }

        try {
            const ns = (await helmUtil.isHelm3(selector)) ? namespace : tillerNamespace;

            const result = await sdk.kubernetes.rollback({
                release: releaseName,
                selector,
                tillerNamespace: ns,
                revision,
            });

            const workflowId = result.id;

            if (argv.detach) {
                console.log(workflowId);
                return;
            }
            const exitCode = await followLogs(workflowId);
            process.exit(exitCode);
        } catch (err) {
            Output.printError(err);
            process.exit(1);
        }
    },
});

module.exports = rollback;
