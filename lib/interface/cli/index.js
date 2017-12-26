#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const yargs = require('yargs');
const CFError = require('cf-errors');
const DEFAULTS = require('./defaults');
const authManager = require('../../logic').auth.manager;
const { printError } = require('./helpers/general');

process.on('uncaughtException', function (err) {
    console.error('uncaughtException', err.stack);
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error.stack);
});

// Load commands
const commands = fs.readdirSync(path.resolve(__dirname, './commands'));
_.forEach(commands, (command) => {
    if (fs.existsSync(path.resolve(__dirname, './commands', command, 'loader.js'))) {
        require(path.resolve(__dirname, './commands', command, 'loader.js'));
    }
});

yargs
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
    });

// add commands to yargs
const rootDir = fs.readdirSync(path.resolve(__dirname, 'commands', 'root'));
_.forEach(rootDir, (file) => {
    if (file.endsWith('.cmd.js')) {
        const command = require(path.resolve(__dirname, 'commands', 'root', file));
        yargs.command(command.toCommand());
    }
});

yargs // eslint-disable-line
    .completion()
    .demandCommand(1, 'You need at least one command before moving on')
    .wrap(null)
    .help('help')
    .option('help', {
        global: false,
    })
    .argv;
