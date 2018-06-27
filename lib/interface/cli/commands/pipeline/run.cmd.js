const debug = require('debug')('codefresh:cli:run:pipeline');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption, crudFilenameOption } = require('../../helpers/general');
const ObjectID = require('mongodb').ObjectID;
const { workflow, pipeline, log } = require('../../../../logic').api;
const authManager = require('../../../../logic').auth.manager;


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

        try {
            await pipeline.getPipelineByName(pipelineName);
        } catch (err) {
            throw new CFError({
                message: `Passed pipeline id: ${pipelineName} does not exist`,
            });
        }

        const executionRequests = [];
        const executionRequestTemplate = {
            pipelineName,
            options: {
                noCache,
                resetVolume,
                branch,
                sha,
                enableNotifications,
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


    },
});

module.exports = run;
