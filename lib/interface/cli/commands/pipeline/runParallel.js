'use strict';
debugger;
const debug = require('debug')('codefresh:cli:run:pipeline');
const _ = require('lodash');
const CFError = require('cf-errors');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline } = require('../../../../logic').api;
const fs = require('fs');
// TODO
// 1. support passing a commit too
// 2. fix env variable input format (check yargs i think there is a nice support for this)

const command = 'pipeline-parallel';

const describe = 'run a test pipelines';

const builder = (yargs) => {
    console.log('in builder');
    return yargs
        .usage('Running a mulitples pipelines adn wait for completions')
        .option('jobs', {
            type: 'array',
            describe: 'pipeline id or name',
            coerce: (jobs) => {
                debugger;
                console.log(`ids positional ${JSON.stringify(jobs)}`);
                return _.map(jobs, (id) => {
                    return { id };
                });
                //  return {jobs:['5a17cd9620ae550001c2ad5d']}
            }
        })
        .option('args', {
            describe: 'Reset pipeline cached volume',
            type: 'string',
            alias: 'rv',
            default: false,
            coerce: (args) => {
                console.log(`args options ${JSON.stringify(args)}`);
                //process.exit(1);
                return { jobsArgs: ['a'] };
            }
        })
        .option('envFile', {
            describe: 'Set environment variables',
            default: [],
            type: 'string',
            coerce: (envFile) => {

                console.log(`handling env file ${envFile}`);
                let envs = fs.readFileSync(envFile);
                envs = JSON.parse(envs);
                console.log(envs.dataset);
                return envs.dataset;
            }

        })
        .option('env', {
            describe: 'Set environment variables',
            default: [],
            type: 'array',
            coerce: (envs) => {
                let ret = {};
                let id =
                    _.map(envs, (env) => {
                        let e = env.split('=');
                        //return {key: e[0], value: e[1]};
                        _.set(ret, e[0], e[1]);
                    });
                return ret;
            },
            alias: 'e'
        });
};

const handler = (argv) => {
    console.log('!!!!' + argv);
    if (argv.envs || argv.envFile) {
        console.log(JSON.stringify(argv.envs));
        console.log('env file' + JSON.stringify(argv.envFile));
        //process.exit(1);
    }
    argv.jobs = _.map(argv.envFile, ((env) => {
        console.log(env);
        return {
            id: argv.jobs[0].id,
            envs: env
        };
    }));
    console.log(argv.jobs);
    let pipelines = argv.id;
    let MultipleJobRunner = require('../../../../../logic/api/workflow');
    let runner = new MultipleJobRunner(argv.jobs);
    return new Promise((resolve, reject) => {
        runner.run();
        let p = () => {
            let dots = '.';
            return () => {
                dots += '.';
                console.log(dots);
            };
        };
        runner.on('progress', p);
        runner.on('end', (data) => {
            console.log(`all jobs where completed ${JSON.stringify(data)}`);
            resolve(data);
        });
    });

};


module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
