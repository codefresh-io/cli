'use strict';

const debug                                            = require('debug')('codefresh:cli:run:pipeline');
const _                                                = require('lodash');
const CFError                                          = require('cf-errors');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { pipeline }                                     = require('../../../../../logic').api;

// TODO
// 1. support passing a commit too
// 2. fix env variable input format (check yargs i think there is a nice support for this)

const command = 'test-pipelines <ids>';

const describe = 'run a pipelines';

const builder = (yargs) => {
    return yargs
        .usage('Running a mulitples pipelines adn wait for completions')
        .positional('ids', {
            describe: 'pipeline id or name',
            coerce : (args)=>{
              return ['5a17cd9620ae550001c2ad5d']
            }
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
            default: [],
            alias: 'e',
        });
};

const handler = async (argv) => {
    let pipelines     = argv.id;
    let MultipleJobRunner = require('../../../../../logic/api/workflow')
    let runner = new MultipleJobRunner([],{});
    return new Promise((resolve, reject)=>{
    runner.run();
    let p = ()=>{
      let dots = "."
      return ()=>{
        dots+="."
        console.log(dots);
      }
    }
    runner.on('progress', p);
    runner.on('end', (data)=>{
      console.log(`all jobs where completed ${JSON.stringify(data)}`);
      resolve(data);
    });
    })

};


module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
