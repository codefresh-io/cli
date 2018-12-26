const _ = require('lodash');
const Command = require('../../Command');
const getCmd = require('../root/get.cmd');
const { token } = require('../../../../logic').api;
const { specifyOutputForArray } = require('../../helpers/get');

const command = new Command({
    command: 'tokens [names|ids..]',
    aliases: ['token'],
    parent: getCmd,
    description: 'Get Codefresh tokens',
    webDocs: {
        category: 'Tokens',
        title: 'Delete tokens',
    },
    builder: (yargs) => {
        return yargs
            .positional('names', {
                describe: 'Token names or ids',
            })
            .example('codefresh get tokens', 'Get all tokens')
            .example('codefresh get tokens token1 5bfc0bba425356822d6dc2bc', 'Get specified tokens');
    },
    handler: async (argv) => {
        let res = await token.getTokens();
        if (!_.isEmpty(argv.names)) {
            res = res.filter(t => argv.names.includes(t.info.name) || argv.names.includes(t.info.id));
        }
        specifyOutputForArray(argv.output, res, argv.pretty);
    },
});

module.exports = command;

