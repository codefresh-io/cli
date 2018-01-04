const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline } = require('../../../../logic').api;
const describeRoot = require('../root/describe.cmd');

const command = new Command({
    command: 'pipeline <id|name> [repo-owner] [repo-name]',
    aliases: ['pip'],
    description: 'describe pipeline',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'pipeline id or name',
            })
            .positional('repo-owner', {
                describe: 'repository owner',
            })
            .positional('repo-name', {
                describe: 'repository name',
            });
    },
    handler: async (argv) => {
        const id = argv.id;
        const repoOwner = argv['repo-owner'];
        const repoName = argv['repo-name'];

        let currPipeline;

        if (repoOwner && repoName) {
            currPipeline = await pipeline.getPipelineByNameAndRepo(id, repoOwner, repoName);
        } else {
            currPipeline = await pipeline.getPipelineById(id);
        }
        console.log(currPipeline.describe());
    },
});
describeRoot.subCommand(command);


module.exports = command;

