const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const deleteRoot = require('../root/delete.cmd');

const DEPRECATION_MESSAGE = 'Create runtime-environment is been deperecated. Please use Venona to delete a runtime environment';
const VENONA_REPO_URL = 'https://github.com/codefresh-io/venona';


const command = new Command({
    command: 'runtime-environments name',
    aliases: ['re', 'runtime-environment'],
    parent: deleteRoot,
    description: 'Delete a runtime-environment',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Delete Runtime-Environments',
    },
    handler: async () => {
        console.log(`${DEPRECATION_MESSAGE} ${VENONA_REPO_URL}`);
        process.exit(1);
    },
});


module.exports = command;

