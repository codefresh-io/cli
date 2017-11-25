#!/usr/bin/env node
'use strict';

const yargs    = require('yargs');
const path     = require('path');
const DEFAULTS = require('../defaults');
const context  = require('./context');


// commands
const authCommand = require('./commands/auth');


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
        global: false
    })
    .config('cfconfig', 'Custom path for authentication contexts config file', (configFilePath) => {
        context.loadConfigFile(configFilePath);
    })
    .command(authCommand)
    .demandCommand(1, 'You need at least one command before moving on')
    .help("h")
    .alias("h", "help")
    .argv;

