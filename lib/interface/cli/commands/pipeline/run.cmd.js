const debug = require('debug')('codefresh:cli:run:pipeline');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption, crudFilenameOption } = require('../../helpers/general');
const ObjectID = require('mongodb').ObjectID;
const { workflow, pipeline, pipeline2, log } = require('../../../../logic').api;
const authManager = require('../../../../logic').auth.manager;


const run = new Command({
    root: true,
    command: 'run <id>',
    description: 'Run a pipeline and attach the created workflow logs.',
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
                require: true,
            })
            .positional('id', {
                describe: 'Pipeline id',
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
            .example('codefresh run PIPELINE_ID -b=master', 'Defining the source control context using a branch')
            .example('codefresh run PIPELINE_ID -s=52b992e783d2f84dd0123c70ac8623b4f0f938d1', 'Defining the source control context using a commit')
            .example('codefresh run PIPELINE_ID -b=master -v key1=value1 -v key2=value2', 'Setting variables through the command')
            .example('codefresh run PIPELINE_ID -b=master --var-file ./var_file.yml', 'Settings variables through a yml file')
            .example('codefresh run PIPELINE_ID -b=master --context context', 'Inject contexts to the pipeline execution');

        crudFilenameOption(yargs, {
            name: 'variable-file',
            alias: 'var-file',
            describe: 'Set build variables from a file',
        });

        return yargs;
    },
    handler: async (argv) => {
        const pipelineId = argv.id;
        const branch = argv.branch;
        const sha = argv.sha;
        const noCache = argv['no-cache'];
        const resetVolume = argv['reset-volume'];
        const variablesFromFile = argv['var-file'];
        const contexts = argv['context'];

        if (!authManager.getCurrentContext()
                .isBetaFeatEnabled()) {
            // validate that passed pipeline id an a mongo object id in case of pipeline V1
            if (!ObjectID.isValid(pipelineId)) {
                throw new CFError({
                    message: `Passed pipeline id: ${pipelineId} is not valid`,
                });
            }
        }

        let pipelineVersion = 'v1';
        if (authManager.getCurrentContext()
                .isBetaFeatEnabled()) {
            try {
                await pipeline.getPipelineById(pipelineId);
            } catch (err) {
                try {
                    await pipeline2.getPipelineByName(pipelineId);
                    pipelineVersion = 'v2';
                } catch (err) {
                    throw new CFError({
                        message: `Passed pipeline id: ${pipelineId} does not exist`,
                    });
                }
            }
        }


        const executionRequests = [];
        const executionRequestTemplate = {
            pipelineId,
            options: {
                noCache,
                resetVolume,
                branch,
                sha,
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

        _.forEach(executionRequests, async ({ pipelineId, options }) => {
            let workflowId;
            if (pipelineVersion === 'v1') {
                workflowId = await pipeline.runPipelineById(pipelineId, options);
            } else {
                workflowId = await pipeline2.runPipelineByName(pipelineId, options);
            }

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
