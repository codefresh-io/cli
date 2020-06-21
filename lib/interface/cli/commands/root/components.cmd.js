const Command = require('../../Command');


const install = new Command({
    root: true,
    command: 'components',
    description: 'Manages Codefresh CLI components',
    requiresAuthentication: false,
    webDocs: {
        description: 'Codefresh CLI components',
        category: 'Codefresh CLI components',
        title: 'components',
        weight: 40,
    },
});

module.exports = install;
