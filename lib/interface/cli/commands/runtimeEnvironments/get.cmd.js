const Command = require('../../Command');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const Output = require('../../../../output/Output');
const DEFAULTS = require('../../defaults');
const CFError = require('cf-errors'); // eslint-disable-line
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'runtime-environments [name]',
    aliases: ['re', 'runtime-environment'],
    parent: getRoot,
    description: 'Get a runtime environments configuration',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Get Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environments name',
            })
            .option('version', {
                describe: 'Runtime environments version',
            })
            .option('history', {
                describe: 'Return all the history of the specific runtime environments',
                type: 'boolean',
            })
            .option('limit', {
                describe: 'Limit amount of returned results',
                default: DEFAULTS.GET_LIMIT_RESULTS,
            })
            .option('page', {
                describe: 'Paginated page',
                default: DEFAULTS.GET_PAGINATED_PAGE,
            })
            .option('extend', {
                describe: 'Return an extend runtime environment ',
                type: 'boolean',
                default: false,
            });
    },
    handler: async (argv) => {
        const { name, version, history, extend, limit, page } = argv;
        const offset = (page - 1) * limit;
        if (history) {
            if (!name) {
                throw new CFError('Name must be provided for history');
            }
            const allHistory = await runtimeEnvironments.getRuntimeEvironmentsByNameForAccount({
                name,
                history,
            });
            console.log(JSON.stringify(allHistory, null, '\t'));

        } else if (name) {
            const currRuntimeEnvironments = await runtimeEnvironments.getRuntimeEvironmentsByNameForAccount({
                name,
                version,
                extend,
            });
            Output.print(currRuntimeEnvironments);
        } else {
            const re = await runtimeEnvironments.getAllRuntimeEnvironmentsForAccount({
                limit,
                offset,
            });
            Output.print(re);
        }
    },
});

module.exports = command;

