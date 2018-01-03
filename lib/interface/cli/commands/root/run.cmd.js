const debug = require('debug')('codefresh:cli:run:pipeline');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline } = require('../../../../logic').api;
const ObjectID = require('mongodb').ObjectID;


const run = new Command({
    root: true,
    command: 'run <id>',
    description: 'Run a pipeline',
    builder: (yargs) => {
        return yargs
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
            .option('env', {
                describe: 'Set environment variables',
                default: [],
                alias: 'e',
            })
            .option('scale', {
                describe: 'todo',
                type: 'number',
                default: 1,
            });
    },
    handler: async (argv) => {
        const pipelineId = argv.id;
        const branch = argv.branch;
        const sha = argv.sha;
        const noCache = argv['no-cache'];
        const resetVolume = argv['reset-volume'];
        const scale = argv['scale'];

        const envVars = prepareKeyValueFromCLIEnvOption(argv.env);

        const options = {
            envVars,
            noCache,
            resetVolume,
            branch,
            sha,
        };

        if (!ObjectID.isValid(pipelineId)) {
            throw new CFError({
                message: `Passed pipeline id: ${pipelineId} is not valid`,
            });
        }

        for (var i = 0; i < scale; i++) {
            const res = await pipeline.runPipelineById(pipelineId, options);
            console.log(res);
        }
    },
});

module.exports = run;
