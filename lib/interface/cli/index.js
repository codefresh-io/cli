#!/usr/bin/env node

const yargs = require('yargs');
const CFError = require('cf-errors');
const DEFAULTS = require('./defaults');
const authManager = require('../../logic').auth.manager;
const { printError } = require('./helpers/general');


// load this dynamically
const rootCommands = require('./commands/root');
require('./commands/auth');
require('./commands/image');
require('./commands/pipeline');
require('./commands/context');
require('./commands/composition');
require('./commands/workflow');
require('./commands/environment');

process.on('uncaughtException', function (err) {
    console.error('uncaughtException', err.stack);
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error.stack);
});


const argv = yargs
    .env('')
    .options('cfconfig', {
        default: DEFAULTS.CFCONFIG,
        global: false,
    })
    .option('version', {
        alias: 'v',
        global: false,
    })
    .config('cfconfig', 'Custom path for authentication contexts config file', (configFilePath) => {
        try {
            authManager.loadContexts(configFilePath, process.env.CF_TOKEN, process.env.CF_URL || DEFAULTS.URL);
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    })
    .command(rootCommands.annotate.toCommand())
    .command(rootCommands.auth.toCommand())
    .command(rootCommands.get.toCommand())
    .command(rootCommands.apply.toCommand())
    .command(rootCommands.create.toCommand())
    .command(rootCommands.delete.toCommand())
    .command(rootCommands.replace.toCommand())
    .command(rootCommands.describe.toCommand())
    .command(rootCommands.run.toCommand())
    .completion()
    .demandCommand(1, 'You need at least one command before moving on')
    .wrap(null)
    .help('help')
    .option('help', {
        global: false,
    })
    .argv;
