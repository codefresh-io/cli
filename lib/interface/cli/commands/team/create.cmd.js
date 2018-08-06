const Command = require('../../Command');
const { team } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');


const command = new Command({
    command: 'teams <name>',
    aliases: ['team', 'tm'],
    parent: createRoot,
    description: 'Create a team',
    usage: 'You can create a new team specifying only name of team or specify path to json file for include extended options' +
    '\n Possible fields in file:' +
    '\n name - team name (specifying name in file will rewrite name specified as command argument) ' +
    '\n users - array of users id for that team ' +
    '\n tags - array of tag names',
    webDocs: {
        category: 'Teams',
        title: 'Create team',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of team',
            })
            .example('codefresh create team NAME', 'Creating a team specifying only team name')
            .example('codefresh create team NAME -f [pathToFile]', 'Creating a team using a file to specify additional options');
    },
    handler: async (argv) => {
        const reqBody = Object.assign({ name: argv.name }, argv.f);

        await team.createTeam(reqBody);
        console.log(`Team: ${reqBody.name} created`);
    },
});


module.exports = command;
