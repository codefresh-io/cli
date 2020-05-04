const Command = require('../../Command');


const hybrid = new Command({
    root: true,
    command: 'hybrid',
    description: 'Manage hybrid resources',
    usage: 'Manage codefresh hybrid solution\'s components on kubernetes cluster',
    webDocs: {
        description: 'Manage and install hybrid resources',
        category: 'Hybrid Resources',
        title: 'Hybrid',
        weight: 40,
    },
});

module.exports = hybrid;
