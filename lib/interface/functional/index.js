#!/usr/bin/env node

const DEFAULTS = require('./defaults');
const authManager = require('../../logic').auth.manager;

// process.on('uncaughtException', function (err) {
//     console.error('uncaughtException', err.stack);
// });
//
// process.on('unhandledRejection', error => {
//     // Will print "unhandledRejection err is not defined"
//     console.error('unhandledRejection', error.stack);
// });

function initialize(
    configFilePath = DEFAULTS.CFCONFIG,
    codefreshUrl = DEFAULTS.URL,
    codefreshApiKey = null,
) {
    authManager.loadContexts(configFilePath, codefreshApiKey, codefreshUrl);
}

module.exports = {
    initialize,
};
