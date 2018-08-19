const Command = require('../../Command');
const { team } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');


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
        await team.removeUserFromTeam(argv['team-id'], argv['user-id']);
        console.log(`User: ${argv['user-id']} was removed from team: ${argv['team-id']}`);
    },
});


module.exports = command;

