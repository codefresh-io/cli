const Command = require('../../Command');
const createRoot = require('../root/create.cmd');

const DEPRECATION_MESSAGE = 'Create runtime-environment is been deprecated. Please use Venona to create a runtime-environment';
const VENONA_REPO_URL = 'https://github.com/codefresh-io/venona';

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
        console.log(`${DEPRECATION_MESSAGE} ${VENONA_REPO_URL}`);
        process.exit(1);
    },
});


module.exports = command;
