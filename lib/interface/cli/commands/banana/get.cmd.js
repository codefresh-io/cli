const Command = require('../../Command');
const _ = require('lodash');
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');

const validateCmd = new Command({
    parent: getRoot,
    command: 'banana',
    description: 'child descr',
    usage: 'child usage',
    webDocs: {
        category: 'New',
        title: 'wateva',
        weight: 100,
    },
    builder: (yargs) => {
        yargs
            .option('something', {
                describe: 'somethig descr'
            })
    },
    handler: async (argv) => {
        await sdk.banana.list({ size: '50' });
    },
});

module.exports = validateCmd;
