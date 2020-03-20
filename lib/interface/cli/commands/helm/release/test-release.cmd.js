const Command = require('../../../Command');
const { followLogs } = require('../../../helpers/logs');
const { sdk } = require('../../../../../logic');
const Output = require('../../../../../output/Output');
const helmUtil = require('./util');

const install = new Command({
    root: true,
    command: 'test-release <name>',
    description: 'Test a helm release',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Test Helm Release',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                description: 'Release name',
                type: 'string',
                required: true,
            })
            .option('cluster', {
                description: 'Run on cluster',
                type: 'string',
                required: true,
            })
            .option('tiller-namespace', {
                description: 'namespace where is tiller running ( helm 2 only )',
                type: 'string',
                alias: 'n',
                default: 'kube-system',
            })
            .option('namespace', {
                description: 'namespace where is chart located ( helm 3 )',
                type: 'string',
                alias: 'ns',
                default: 'default',
            })
            .option('timeout', {
                description: 'time in seconds to wait for any individual kubernetes operation (like Jobs for hooks) (default 300)',
                default: '300',
                type: 'number',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .option('cleanup', {
                description: 'delete test pods upon completion (default false)',
                default: false,
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const {
            name: releaseName,
            cluster,
            cleanup,
            timeout,
            'tiller-namespace': tillerNamespace,
            namespace,
        } = argv;
        if (!releaseName) {
            throw new Error('Release name is required');
        }
        try {
            const ns = (await helmUtil.isHelm3(cluster)) ? namespace : tillerNamespace;

            const result = await sdk.helm.releases.test({
                releaseName,
                selector: cluster,
                tillerNamespace: ns,
            }, {
                cleanup,
                timeout,
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

module.exports = install;
