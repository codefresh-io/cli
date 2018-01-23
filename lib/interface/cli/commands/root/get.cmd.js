const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const DEFAULTS = require('../../defaults');


const get = new Command({
    root: true,
    command: 'get',
    description: 'Display one or many resources',
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .option('output', {
                describe: 'Output format',
                alias: 'o',
                choices: ['json', 'yaml', 'wide', 'name'],
                group: 'Output Options',
            })
            .option('watch', {
                describe: 'Watching updates to a particular resource',
                alias: 'w',
                type: Boolean,
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

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
