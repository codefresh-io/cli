#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const CFError = require('cf-errors');
const DEFAULTS = require('./defaults');
const authManager = require('../../logic').auth.manager;
const { printError } = require('./helpers/general');


// load this dynamically
const rootCommands = require('./commands/root');
const authCommands = require('./commands/auth');
const imageCommands = require('./commands/image');
const pipelineCommands = require('./commands/pipeline');
const contextCommands = require('./commands/context');
const compositionCommands = require('./commands/composition');
const workflowCommands = require('./commands/workflow');
const environmentCommands = require('./commands/environment');

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
    // .command(auth)
    // .command(run)
    // .command(createResource)
    // .command(getResource)
    // .command(deleteResource)
    // .command(describeResource)
    // .command(applyResource)
    // .command(replaceResource)
    // .command(annotate)
    .completion()
    .demandCommand(1, 'You need at least one command before moving on')
    .wrap(null)
    .help('help')
    .option('help', {
        global: false,
    })
    .argv;
