const Command = require('../../Command');
const createRoot = require('../root/create.cmd');

const DEPRECATION_MESSAGE = 'Create runtime-environment command has been deprecated.\nUse codefresh install runtime command instead';

const command = new Command({
    command: 'runtime-environments [cluster]',
    aliases: ['re', 'runtime-environment'],
    parent: createRoot,
    description: 'Create a runtime environment',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Create Runtime-Environments',
        weight: 100,
    },
    handler: async () => {
        console.log(`${DEPRECATION_MESSAGE}`);
        process.exit(1);
    },
});


module.exports = command;
