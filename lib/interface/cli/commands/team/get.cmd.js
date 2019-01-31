const Command = require('../../Command');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');
const Team = require('../../../../logic/entities/Team');


const command = new Command({
    command: 'teams',
    aliases: ['team', 'tm'],
    parent: getRoot,
    description: 'Get an array of all current user teams',
    webDocs: {
        category: 'Teams',
        title: 'Get Teams',
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh get teams', 'Get all teams for current account');
    },
    handler: async (argv) => {
        const teams = await sdk.teams.getAll();
        Output.print(teams.map(Team.fromResponse));
    },
});


module.exports = command;

