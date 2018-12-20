const debug = require('debug')('codefresh:cli:run:pipeline');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption, crudFilenameOption } = require('../../helpers/general');
const { workflow, pipeline, log } = require('../../../../logic').api;
const authManager = require('../../../../logic').auth.manager;
const Docker = require('dockerode');
const { validatePipelineYaml } = require('../../helpers/validation');
const { printResult } = require('../root/validate.cmd');

const regex = /##[0-9a-f]{24}##/i;
const imageName = 'codefresh/engine:master';


const run = new Command({
    root: true,
    command: 'run <name>',
    description: 'Run a pipeline by id or name and attach the created workflow logs.',
    usage: 'Returns an exit code according to the workflow finish status (Success: 0, Error: 1, Terminated: 2)',
    webDocs: {
        category: 'Pipelines',
        title: 'Run Pipeline',
        weight: 50,
    },
    builder: (yargs) => {
        yargs
            .option('branch', {
                describe: 'Branch',
                alias: 'b',
            })
            .positional('name', {
                describe: 'Pipeline name',
            })
            .option('sha', {
                describe: 'Set commit sha',
                alias: 's',
            })
            .option('no-cache', {
                describe: 'Ignore cached images',
                alias: 'nc',
                default: false,
            })
            .option('enable-notifications', {
                describe: 'Report notifications about pipeline execution',
                alias: 'en',
                default: false,
            })
            .option('reset-volume', {
                describe: 'Reset pipeline cached volume',
                alias: 'rv',
                default: false,
            })
            .option('variable', {
                describe: 'Set build variables',
                default: [],
                alias: 'v',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .option('context', {
                alias: 'c',
                describe: 'Run pipeline with contexts',
                default: [],
            })
            .option('local', {
                describe: 'Run pipeline on your local docker machine',
                type: Boolean,
                default: false,
            })
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master', 'Defining the source control context using a branch')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -s=52b992e783d2f84dd0123c70ac8623b4f0f938d1', 'Defining the source control context using a commit')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master -v key1=value1 -v key2=value2', 'Setting variables through the command')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master --var-file ./var_file.yml', 'Settings variables through a yml file')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master --context context', 'Inject contexts to the pipeline execution');

        crudFilenameOption(yargs, {
            name: 'variable-file',
            alias: 'var-file',
            describe: 'Set build variables from a file',
        });

        crudFilenameOption(yargs, {
            name: 'yaml',
            alias: 'y',
            raw: true,
            describe: 'Override codefresh.yaml for this execution',
        });

        return yargs;
    },
    handler: async (argv) => {
        const pipelineName = argv.name;
        const branch = argv.branch;
        const sha = argv.sha;
        const noCache = argv['no-cache'];
        const enableNotifications = argv['enable-notifications'];
        const resetVolume = argv['reset-volume'];
        const variablesFromFile = argv['var-file'];
        const contexts = argv['context'];
        const userYamlDescriptor = argv['yaml'];
        const local = argv.local;

        try {
            await pipeline.getPipelineByName(pipelineName);
        } catch (err) {
            throw new CFError({
                message: `Passed pipeline id: ${pipelineName} does not exist`,
            });
        }

        if (userYamlDescriptor) {
            const result = await validatePipelineYaml(undefined, userYamlDescriptor);
            printResult(result);
        }

        if (local) {
            const docker = new Docker();
            docker.pull(imageName, (err, stream) => {
                docker.modem.followProgress(stream, onFinished, onProgress);
                function onFinished(err) {
                    if (!err) {
                        console.log('\nDone pulling.');
                        const currentContext = authManager.getCurrentContext();
                        docker.run(imageName, [], [], {
                            Env: [
                                `ACCESS_TOKEN=${currentContext.token}`,
                                `PIPELINE_ID=${pipelineName}`, `BRANCH=${branch}`,
                                `CF_HOST=${currentContext.url}`,
                                'DOCKER_SOCKET_PATH=/var/run/docker.sock',
                                userYamlDescriptor && `OVERRIDE_WORKFLOW_YAML=${userYamlDescriptor}`,
                            ],
                            Hostconfig: {
                                Binds: [
                                    '/var/run/docker.sock:/var/run/docker.sock',
                                ],
                            },
                        }, (err, data) => {
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
        } else {
            const executionRequests = [];
            const executionRequestTemplate = {
                pipelineName,
                options: {
                    noCache,
                    resetVolume,
                    branch,
                    sha,
                    enableNotifications,
                    userYamlDescriptor,
                },
            };

            if (variablesFromFile) {
                _.forEach(variablesFromFile, (variables) => {
                    const request = _.cloneDeep(executionRequestTemplate);
                    request.options.variables = variables;
                    executionRequests.push(request);
                });
            } else {
                const variables = prepareKeyValueFromCLIEnvOption(argv.variable);
                const request = _.cloneDeep(executionRequestTemplate);
                request.options.variables = variables;
                request.options.contexts = contexts;
                executionRequests.push(request);
            }

            _.forEach(executionRequests, async ({ pipelineName, options }) => {
                let workflowId;
                workflowId = await pipeline.runPipelineByName(pipelineName, options);

                if (executionRequests.length === 1) {
                    if (argv.detach) {
                        console.log(workflowId);
                    } else {
                        await log.showWorkflowLogs(workflowId, true);
                        const workflowInstance = await workflow.getWorkflowById(workflowId);
                        switch (workflowInstance.getStatus()) {
                            case 'success':
                                process.exit(0);
                                break;
                            case 'error':
                                process.exit(1);
                                break;
                            case 'terminated':
                                process.exit(2);
                                break;
                            default:
                                process.exit(100);
                                break;
                        }
                    }
                } else {
                    console.log(workflowId);
                }
            });
        }
    },
});

module.exports = run;
