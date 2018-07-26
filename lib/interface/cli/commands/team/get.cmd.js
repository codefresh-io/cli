const Command = require('../../Command');
const _ = require('lodash');
const { team } = require('../../../../logic').api;
const { specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'teams [id|name..]',
    aliases: ['team', 'tm'],
    parent: getRoot,
    description: 'Get a specific team or an array of all user teams',
    usage: 'Passing [id|name] argument will cause a retrieval of a specific team. ' +
    '\nIn case of not passing [id|name] argument, a list of user teams will be returned',
    webDocs: {
        category: 'Teams',
        title: 'Get Teams',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'team id or name',
            })
            .example('codefresh get teams', 'Get all teams')
            .example('codefresh get teams NAME | ID', 'Get a specific team');
    },
    handler: async (argv) => {
        /*
        * teamsIds - team id or name
        * */
        const teamsIds = argv.id;

        let teams = await team.getTeams();

        if (!_.isEmpty(teamsIds) && !_.isEmpty(teams)) {
            teams = teams.filter(({ info: { id, name } = {} }) => {
                return teamsIds.includes(id) || teamsIds.includes(name);
            });
        }

        specifyOutputForArray(argv.output, teams);
    },
});


module.exports = command;

