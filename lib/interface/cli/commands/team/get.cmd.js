const Command = require('../../Command');
const { team } = require('../../../../logic').api;
const { specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'teams [id|name..]',
    aliases: ['team', 'tm'],
    parent: getRoot,
    description: 'Get an array of all current user teams, with specifying user-id get all teams for that user',
    webDocs: {
        category: 'Teams',
        title: 'Get Teams',
    },
    builder: (yargs) => {
        return yargs
            .option('user-id', {
                describe: 'User id',
                alias: 'u',
                required: false,
            })
            .example('codefresh get teams', 'Get all teams for current user')
            .example('codefresh get teams -u [userID]', 'Get all teams for specific user');
    },
    handler: async (argv) => {
        if (argv['user-id']) {
            specifyOutputForArray(argv.output, await team.getTeamsByUserId(argv.id));
        } else {
            specifyOutputForArray(argv.output, await team.getTeamsForCurrentUser());
        }
    },
});


module.exports = command;

