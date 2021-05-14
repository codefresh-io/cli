const Command = require('../../../Command');
const { followLogs } = require('../../../helpers/logs');
const { sdk } = require('../../../../../logic');
const { normalizeValues, normalizeSetValues } = require('../../../helpers/helm');
const Output = require('../../../../../output/Output');

const promote = new Command({
    root: true,
    command: 'helm-promotion',
    description: 'Promote a Helm release in another environment',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Promote Helm Release',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .option('board', {
                description: 'Board for promotion',
                type: 'string',
                required: true,
                alias: 'b',
            })
            .option('source', {
                description: 'Source column',
                type: 'string',
                required: true,
                alias: 's',
            })
            .option('target', {
                description: 'Target column',
                type: 'string',
                required: true,
                alias: 't',
            })
            .option('namespace', {
                description: 'Promote to namespace',
                default: 'default',
                type: 'string',
                alias: 'n',
            })
            .option('source-tiller-namespace', {
                description: 'Where tiller has been installed in source cluster',
                default: 'kube-system',
                type: 'string',
                alias: 'stn',
            })
            .option('target-tiller-namespace', {
                description: 'Where tiller has been installed in target cluster',
                default: 'kube-system',
                type: 'string',
                alias: 'ttn',
            })
            .option('source-release', {
                description: 'The name of source release',
                alias: 'sr',
                required: true,
            })
            .option('revision', {
                description: 'Revision of source release',
                type: 'string',
                alias: 'r',
                required: true,
            })
            .option('target-release', {
                description: 'The name to set to the release',
                alias: 'tr',
            })
            .option('context', {
                description: 'Contexts (yaml || secret-yaml) to be passed to the install',
                array: true,
            })
            .option('set', {
                description: 'set of KEY=VALUE to be passed to the install',
                array: true,
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .example(
                'codefresh helm-promotion --board app --source dev --target test --source-release application',
                `Promote 'application' release on board 'app' from 'dev' to 'test' environment`);
    },
    handler: async (argv) => {
        try {
            const result = await sdk.helm.charts.promote.new({
                selector: argv.sourceCluster,
                tillerNamespace: argv.sourceTillerNamespace,
            }, {
                board: argv.board,
                sourceSection: argv.source,
                targetSection: argv.target,
                releaseName: argv.sourceRelease,
                revision: argv.revision,
                targetSelector: argv.targetCluster,
                targetTillerNamespace: argv.targetTillerNamespace,
                targetNamespace: argv.namespace,
                targetReleaseName: argv.targetRelease,
                values: await normalizeValues(argv.context),
                set: await normalizeSetValues(argv.set),
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

module.exports = promote;
