'use strict';

const debug           = require('debug')('codefresh:cli:run:pipeline');
const _               = require('lodash');
const CFError         = require('cf-errors');
const { wrapHandler } = require('../../../helper');
const { pipeline }    = require('../../../../../logic').api;

// TODO
// 1. support passing a commit too
// 2. fix env variable input format (check yargs i think there is a nice support for this)

const command = 'pipeline <id|name> [repo-owner] [repo-name]';

const describe = 'run a pipeline';

const builder = (yargs) => {
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
            describe: 'repository owner',
        })
        .positional('repo-name', {
            describe: 'repository name',
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
            default: {},
            alias: 'e',
        });
};

const handler = async (argv) => {
    let pipelineId     = argv.id;
    const pipelineName = argv.name;
    const branch       = argv.branch;
    const sha          = argv.sha;
    const repoOwner    = argv['repo-owner'];
    const repoName     = argv['repo-name'];
    const noCache      = argv['no-cache'];
    const resetVolume  = argv['reset-volume'];

    const envVars = _extractVariables(argv.env);

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
        pipelineId           = calcedPipeline._id;
    }

    const res = await pipeline.runPipelineById(pipelineId, options);
    console.log(`Pipeline run processed successfully. Created workflow: ${res}`);
};


// TODO this might be removed. or improved. see TODO in upper part
const _extractVariables = (environmentVariables) => {
    let variables = {};
    let envArray  = [];
    environmentVariables.constructor !== Array ? envArray.push(environmentVariables) : envArray = environmentVariables;
    envArray.forEach(function (vars) {
        let fields = vars.split("=");
        let key    = fields[0];
        let val    = fields[1];
        if (_.isUndefined(key) || _.isUndefined(val)) {
            throw new CFError('Invalid environment variable format. please enter [key]=[value]');
        }
        variables[key] = val;
    });
    return variables;
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
