const Command = require('../../../../Command');
const createContext = require('../../create.cmd');
const yargs = require('yargs');

const command = new Command({
    command: 'helm-repository',
    parent: createContext,
    description: 'Create a helm-repository context [type]',
    usage: '',
    webDocs: {
        category: 'Create Context',
        subCategory: 'Helm Repository',
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

