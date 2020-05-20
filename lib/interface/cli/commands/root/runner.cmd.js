const Command = require('../../Command');


const runner = new Command({
    root: true,
    command: 'runner',
    description: 'Manage runner resources',
    requiresAuthentication: argv => argv && !argv.token,
    usage: 'Manage codefresh runner solution\'s components on kubernetes cluster',
    webDocs: {
        description: 'Manage and install runner resources',
        category: 'Runner Resources',
        title: 'Runner',
        weight: 40,
    },
});

module.exports = runner;
