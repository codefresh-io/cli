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
    description: 'Run a pipeline and attach the created workflow logs.\nReturns an exist code according to the workflow finish status (Success: 0, Error: 1, Terminated: 2).',
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'Pipeline id',
            })
            .option('branch', {
                describe: 'Branch',
                alias: 'b',
                require: true,
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
                describe: 'Set workflow variables',
                default: [],
                alias: 'v',
            })
            .option('scale', {
                describe: 'todo',
                type: 'number',
                default: 1,
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print workflow ID',
            });

        crudFilenameOption(yargs, {
            name: 'variable-file',
            alias: 'var-file',
            describe: 'Set workflow variables from a file',
        });

        return yargs;
    },
    handler: async (argv) => {
        const pipelineId = argv.id;
        const branch = argv.branch;
        const sha = argv.sha;
        const noCache = argv['no-cache'];
        const resetVolume = argv['reset-volume'];
        const scale = argv['scale'];
        const variablesFromFile = argv['var-file'];


        if (!authManager.getCurrentContext()
                .isBetaFeatEnabled()) {
            // validate that passed pipeline id an a mongo object id in case of pipeline V1
            if (!ObjectID.isValid(pipelineId)) {
                throw new CFError({
                    message: `Passed pipeline id: ${pipelineId} is not valid`,
                });
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
            for (var i = 0; i < scale; i++) {
                const variables = prepareKeyValueFromCLIEnvOption(argv.variable);
                const request = _.cloneDeep(executionRequestTemplate);
                request.options.variables = variables;
                executionRequests.push(request);
            }
        }

        _.forEach(executionRequests, async ({ pipelineId, options }) => {
            let workflowId;
            if (authManager.getCurrentContext()
                    .isBetaFeatEnabled()) {
                workflowId = await pipeline2.runPipelineByName(pipelineId, options);
            } else {
                workflowId = await pipeline.runPipelineById(pipelineId, options);
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
