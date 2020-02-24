const Command = require('../../Command');


const install = new Command({
    root: true,
    command: 'install',
    description: 'Instal a resource',
    usage: 'Install operation will install codefresh components on kubernetes cluster',
    webDocs: {
        description: 'Install a resource',
        category: 'Install Resources',
        title: 'Install',
        weight: 40,
    },
});

module.exports = install;
