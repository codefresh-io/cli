const debug = require('debug')('codefresh:cli:run:pipeline');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline } = require('../../../../logic').api;
const runRoot = require('../root/run.cmd');


const command = new Command({
    command: 'pipeline <id|name> [repo-owner] [repo-name]',
    description: 'Run a pipeline',
    builder: (yargs) => {
        return yargs
            .usage('Running a pipeline:\n' +
                '\n' +
                '1. Provide an explicit pipeline id\n' +
                '\n' +
                '2. Provide a pipeline name, repository owner and repository name \n')
            .positional('id', {
                describe: 'pipeline id or name',
            })
            .positional('repo-owner', {
                describe: 'Repository owner',
            })
            .positional('repo-name', {
                describe: 'Repository name',
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
        let pipelineId = argv.id;
        const pipelineName = argv.name;
        const branch = argv.branch;
        const sha = argv.sha;
        const repoOwner = argv['repo-owner'];
        const repoName = argv['repo-name'];
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

        if (repoName || repoOwner) {
            // run pipeline by name, repo owner and repo name
            if (!repoName || !repoOwner) {
                throw new CFError('repository owner and repository name must be provided');
            }

            const calcedPipeline = await pipeline.getPipelineByNameAndRepo(pipelineName, repoOwner, repoName);
            pipelineId = calcedPipeline._id;
        }

        for (var i = 0; i < scale; i++) {
            const res = await pipeline.runPipelineById(pipelineId, options);
            console.log(`Pipeline run processed successfully. Created workflow: ${res}`);
        }
    },
});
runRoot.subCommand(command);


module.exports = command;
