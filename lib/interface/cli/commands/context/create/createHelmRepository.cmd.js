const debug = require('debug')('codefresh:cli:create:context:helmRepo');
const Command = require('../../../Command');
const createContext = require('../create.cmd');

const command = new Command({
    command: 'helm-repository',
    parent: createContext,
    description: 'Create a helm-repository context [type]',
    webDocs: {
        category: 'Create Context',
        subCategory : 'Helm Repository',
        title: 'Create Helm-Repository Context',
    },
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        yargs.showHelp();
    },
});

module.exports = command;

