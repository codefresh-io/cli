const Command = require('../../Command');
const { team } = require('../../../../logic').api;
const syncRoot = require('../root/synchronize.cmd');

const command = new Command({
    command: 'teams client-name',
    aliases: ['team', 'tm'],
    parent: syncRoot,
    description: 'Synchronize team with group',
    webDocs: {
        category: 'Teams',
        title: 'Synchronize Teams',
    },
    builder: (yargs) => {
        return yargs
            .option('client-type', {
                describe: 'Client type like github',
                alias: 't',
                required: true,
            })
            .option('access-token', {
                describe: 'Access token (for github personal access token)',
                alias: 'tk',
                required: false,
            })
            .example('codefresh synchronize teams [clientName] -t [clientType] -tk [accessToken]', 'Synchronize team with group');
    },
    handler: async (argv) => {
        console.log(JSON.stringify(await team.synchronizeClientWithGroup(argv['client-name'], argv.t, argv['access-token']), null, 2));
    },
});


module.exports = command;

