const Command = require('../../Command');
const applyRoot = require('../root/apply.cmd');
const { sdk } = require('../../../../logic');


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
        const { teamId, userId } = argv;
        await sdk.teams.addUser({ teamId, userId });
        console.log(`User: ${userId} was assigned to team: ${teamId}`);
    },
});


module.exports = command;

