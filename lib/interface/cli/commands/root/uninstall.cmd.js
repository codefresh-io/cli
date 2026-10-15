const Command = require('../../Command');


const unInstall = new Command({
    root: true,
    command: 'uninstall',
    description: 'Uninstall a resource',
    usage: 'Uninstall operation will uninstall codefresh components on kubernetes cluster',
    webDocs: {
        description: 'Uninstall a resource',
        category: 'Uninstall Resources',
        title: 'Uninstall',
        weight: 40,
    },
});

module.exports = unInstall;
