const yargs = require('yargs');

const Command = require('../../../../Command');
const createContext = require('../../create.cmd');

const usage = 'Secret-Store context are used during pipeline execution as API to resolve variables that are parse of Codefresh';

const command = new Command({
    command: 'secret-store',
    parent: createContext,
    description: 'Create a secret-store context [type]',
    usage,
    webDocs: {
        category: 'Create Context',
        subCategory: 'Secret-Store',
        title: 'Create Secret-Store Context',
    },
    builder: (yargs) => {
        yargs
            .option('sharing-policy', {
                describe: 'Set the sharing policy for secret-store context',
                choices: ['AccountAdmins', 'AllUsersInAccount'],
                default: 'AccountAdmins',
            });
        return yargs;
    },
    handler: async (argv) => {
        yargs.showHelp();
    },
});

module.exports = command;

