const Command = require('../../Command');
const { team } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');
const fs = require('fs');


const command = new Command({
    command: 'teams <name>',
    aliases: ['team', 'tm'],
    parent: createRoot,
    description: 'Create a team',
    usage: 'You can create a new team specifying only name of team or specify path to json file for include extended options',
    webDocs: {
        category: 'Teams',
        title: 'Create team',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of team',
            })
            .option('team-file', {
                describe: 'Path to json file to create the team using extended options' +
                '\n Possible fields in file:' +
                '\n name - team name (specifying name in file will rewrite name specified as command argument) ' +
                '\n users - array of users id for that team ' +
                '\n tags - array of tag names',
                alias: 'f',
            })
            .coerce('team-file', (arg) => {
                try {
                    return fs.readFileSync(arg, 'utf8');
                } catch (err) {
                    const error = new CFError({
                        message: 'Failed to read file',
                        cause: err,
                    });
                    printError(error);
                    process.exit(1);
                }
            })
            .example('codefresh create team NAME', 'Creating a team specifying only team name')
            .example('codefresh create team NAME --team-file [pathToFile]', 'Creating a team using a file to specify additional options');
    },
    handler: async (argv) => {
        let parsedTeamFile = {};

        if (argv['team-file']) {
            try {
                parsedTeamFile = JSON.parse(argv['team-file']);
            } catch (e) {
                const error = new CFError({
                    message: 'Error while handling team-file, probably it is parse error',
                    cause: e,
                });

                printError(error);
                process.exit(1);
            }
        }

        const reqBody = Object.assign({ name: argv.name }, parsedTeamFile);

        await team.createTeam(reqBody);
        console.log(`Team: ${reqBody.name} created`);
    },
});


module.exports = command;
