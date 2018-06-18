const debug = require('debug')('codefresh:cli:create:context:git');
const Command = require('../../../../Command');
const createContext = require('../../create.cmd');

const CODEFRESH_GIT_CLONE_REFERENCE = 'https://codefresh.io/docs/docs/codefresh-yaml/steps/git-clone/';

const usage = `Git context are used to clone repositories during pipeline execution.\nLearn more about git context here: ${CODEFRESH_GIT_CLONE_REFERENCE}`;

const command = new Command({
    command: 'git',
    parent: createContext,
    description: 'Create a git context [type]',
    usage,
    webDocs: {
        category: 'Create Context',
        subCategory : 'Git',
        title: 'Create Git Context',
    },
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        yargs.showHelp();
    },
});

module.exports = command;

