const Command = require('../../Command');
const componentsRoot = require('../root/components.cmd');
const helper = require('../hybrid/helper');

const command = new Command({
    command: 'update',
    parent: componentsRoot,
    description: 'Update Codefresh CLI components',
    webDocs: {
        category: 'Componenets',
        title: 'Update',
    },
    handler: async () => {
        console.log('Updating components');
        await helper.downloadRelatedComponents();
    },
});

module.exports = command;
