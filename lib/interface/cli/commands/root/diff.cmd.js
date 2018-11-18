const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const DEFAULTS = require('../../defaults');
const yargs = require('yargs');

const diff = new Command({
    root: true,
    command: 'diff',
    description: 'Show diff between two resources',
    usage: 'Supported resources: runtime-environments',
    webDocs: {
        description: 'Show diff between two resources',
        category: 'Operate On Resources',
        title: 'Diff',
        weight: 100,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs;
    },
    handler: async (argv) => {
        if (!argv.filename) {
            yargs.showHelp();
        }

        const data = argv.filename;
        const entity = data.kind;

        switch (entity) {
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = diff;
