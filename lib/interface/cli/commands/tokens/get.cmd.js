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
    usage: 'Provide names/ids to filter results by them',
    webDocs: {
        category: 'Tokens',
        title: 'Get tokens',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .positional('names', {
                describe: 'Token names or ids',
            })
            .example('codefresh get tokens', 'Get all tokens')
            .example('codefresh get tokens [token_1_name] [token_2_id]', 'Get tokens filtered by names or ids');
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

