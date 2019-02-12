const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'teams',
    aliases: ['team', 'tm'],
    parent: deleteRoot,
    description: 'Remove user from team',
    usage: 'Pass user id and team id to remove user from team',
    webDocs: {
        category: 'Teams',
        title: 'Remove user',
    },
    builder: (yargs) => {
        return yargs
            .option('team-id', {
                describe: 'Id team in which to remove a user',
                alias: 't',
                required: true,
            })
            .option('user-id', {
                describe: 'Id of a user to remove him in team',
                alias: 'u',
                required: true,
            })
            .example('codefresh delete tm -u [userID] -t [teamID]', 'Remove user from team');
    },
    handler: async (argv) => {
        const { teamId, userId } = argv;
        await sdk.teams.removeUser({ teamId, userId });
        console.log(`User: ${userId} was removed from team: ${teamId}`);
    },
});


module.exports = command;

