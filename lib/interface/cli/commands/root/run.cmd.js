const debug = require('debug')('codefresh:cli:run:pipeline');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption, crudFilenameOption } = require('../../helpers/general');
const { pipeline } = require('../../../../logic').api;
const ObjectID = require('mongodb').ObjectID;


const run = new Command({
    root: true,
    command: 'run <id>',
    description: 'Run a pipeline',
    builder: (yargs) => {
        yargs
            .usage('Running a pipeline:\n' +
                '\n' +
                '1. Provide an explicit pipeline id\n' +
                '\n' +
                '2. Provide a pipeline name, repository owner and repository name \n')
            .positional('id', {
                describe: 'Pipeline id',
            })
            .option('branch', {
                describe: 'Branch',
                alias: 'b',
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
            .option('f', {
                describe: 'Show and follow the logs of the created workflow',
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

        if (!ObjectID.isValid(pipelineId)) {
            throw new CFError({
                message: `Passed pipeline id: ${pipelineId} is not valid`,
            });
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

        _.forEach(executionRequests, async (request) => {
            const res = await pipeline.runPipelineById(request.pipelineId, request.options);
            console.log(res);
        });
    },
});

module.exports = run;
