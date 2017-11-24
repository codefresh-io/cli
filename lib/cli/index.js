#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path  = require('path');

// commands
const authCommand = require('./commands/auth');


process.on('uncaughtException', function (err) {
    console.error(err);
});


var argv = yargs
    .command(authCommand)
    .demandCommand(1, 'You need at least one command before moving on')
    .help("h")
    .alias("h", "help")
    .argv;