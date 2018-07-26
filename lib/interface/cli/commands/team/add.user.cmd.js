const Command = require('../../Command');
const { team } = require('../../../../logic').api;
const applyRoot = require('../root/apply.cmd');


const command = new Command({
    command: 'teams',
    aliases: ['team', 'tm'],
    parent: applyRoot,
    description: 'Assign user to a team',
    usage: 'Use patch command and pass user id and team id  to assign user to a team',
    webDocs: {
        category: 'Teams',
        title: 'Add user',
    },
    builder: (yargs) => {
        return yargs
            .option('team-id', {
                describe: 'Id team in which to add a user',
                alias: 't',
                required: true,
            })
            .option('user-id', {
                describe: 'Id of a user to add him in team',
                alias: 'u',
                required: true,
            })
            .example('codefresh patch tm -u [userID] -t [teamID]', 'Assign user to team');
    },
    handler: async (argv) => {
        await team.assignUserToTeam(argv['user-id'], argv['team-id']);
        console.log(`User: ${argv['user-id']} was assigned to team: ${argv['team-id']}`);
    },
});


module.exports = command;

