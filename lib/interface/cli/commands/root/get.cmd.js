const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption, selectColumnsOption } = require('../../helpers/general');
const DEFAULTS = require('../../defaults');
const yargs = require('yargs');

const get = new Command({
    root: true,
    command: 'get',
    description: 'Display one or many resources',
    usage: 'Supported resources:',
    webDocs: {
        description: 'Get a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Get',
        weight: 10,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        selectColumnsOption(yargs);
        yargs
            .option('output', {
                describe: 'Output format',
                alias: 'o',
                choices: ['json', 'yaml', 'wide', 'name', 'id'],
                group: 'Output Options',
            })
            .option('date-format', {
                describe: 'Provide predefined or custom date format. Predefined options: ["default", "date", "datetime", "date-diff"]',
                alias: 'df',
                group: 'Output Options',
            })
            .option('pretty', {
                describe: 'Use colors and signs for output',
                group: 'Output Options',
            })
            .option('watch', {
                describe: 'Watching updates to a particular resource',
                alias: 'w',
                type: 'boolean',
                default: false,
                group: 'Output Options',
            })
            .option('watch-interval', {
                describe: 'Interval time at watching mode (in seconds)',
                default: DEFAULTS.WATCH_INTERVAL_MS / 1000,
                group: 'Output Options',
            })
            .coerce('watch-interval', (watchInterval) => {
                return Math.max(watchInterval * 1000, DEFAULTS.WATCH_INTERVAL_MS);
            });

        return yargs;
    },
    handler: async (argv) => {
        if (!argv.filename) {
            yargs.showHelp();
            return;
        }

        const data = argv.filename;
        const entity = data.kind;

        switch (entity) {
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = get;
