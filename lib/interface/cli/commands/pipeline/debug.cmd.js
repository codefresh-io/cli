const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const { log } = require('../../../../logic').api;
const authManager = require('../../../../logic').auth.manager;
const Docker = require('dockerode');

const regex = /##[0-9a-f]{24}##/i;

const run = new Command({
    root: true,
    command: 'debug <id>',
    description: 'Run a pipeline by id or name and attach the created workflow logs.',
    usage: 'Returns an exit code according to the workflow finish status (Success: 0, Error: 1, Terminated: 2)',
    webDocs: {
        category: 'Pipelines',
        title: 'Run Pipeline',
        weight: 50,
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'Pipeline id',
            })
            .option('branch', {
                describe: 'branch',
                alias: 'b',
                default: 'master',
            })
            .option('yaml', {
                describe: 'Set an alternative yaml',
            })
            .option('volume', {
                describe: 'set a volume from you local system',
                alias: 'v',
            })
            .option('args', {
                describe: 'Report notifications about pipeline execution',
                type: Array,
                default: [],
            })
            .example('codefresh debug PIPELINE_ID | PIPELINE_NAME -b=master', 'Defining the source control context using a branch')

        crudFilenameOption(yargs, {
            name: 'variable-file',
            alias: 'var-file',
            describe: 'Set build variables from a file',
        });

        return yargs;
    },
    handler: async (argv) => {
        const { id, yaml, branch, volume, args } = argv;
        const docker = new Docker();
        docker.pull('codefresh/engine:support_local_engine', (err, stream) => {
            docker.modem.followProgress(stream, onFinished, onProgress);
            function onFinished(err) {
                if (!err) {
                    console.log('\nDone pulling.');
                    const currentContext = authManager.getCurrentContext();
                    docker.run('codefresh/engine:support_local_engine', [], [], {
                        Env: [`ACCESS_TOKEN=${currentContext.token}`, `PIPELINE_ID=${id}`, `BRANCH=${branch}`, `CF_HOST=${currentContext.url}`, 'DOCKER_SOCKET_PATH=/var/run/docker.sock'],
                        Hostconfig: {
                            Binds: ['/var/run/docker.sock:/var/run/docker.sock'],
                        },
                    }, (err, data, container) => {
                        if (err) {
                            return console.error(err);
                        }
                        process.exit(data.StatusCode);
                    }).on('stream', (stream) => {
                        stream.on('data', (chunk) => {
                            const line = chunk.toString();
                            const include = line.match(regex);
                            if (include) {
                                const workflowId = include[0].substring(2, include[0].length - 2);
                                log.showWorkflowLogs(workflowId, true)
                                    .then(() => Promise.resolve());
                            }
                        });
                    });
                } else {
                    console.log(err);
                    process.exit(1);
                }
            }
            function onProgress() {
                stream.pipe(process.stdout);
            }
        });
    },
});

module.exports = run;
