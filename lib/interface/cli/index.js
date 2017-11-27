#!/usr/bin/env node
'use strict';

const yargs          = require('yargs');
const CFError        = require('cf-errors');
const DEFAULTS       = require('./defaults');
const authManager    = require('../../logic').auth.manager;
const { printError } = require('./helper');


// commands
const { auth, run, create } = require('./commands');


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
        global: false,
    })
    .config('cfconfig', 'Custom path for authentication contexts config file', (configFilePath) => {
        try {
            authManager.loadContexts(configFilePath);
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    })
    .command(auth)
    .command(run)
    .command(create)
    .demandCommand(1, 'You need at least one command before moving on')
    .help("help")
    .option('help', {
        global: false,
    })
    .argv;

