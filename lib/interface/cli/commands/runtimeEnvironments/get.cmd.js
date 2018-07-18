const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const DEFAULTS = require('../../defaults');



const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'runtime-environments [name] [version]',
    aliases: ['re', 'runtime-environment'],
    parent: getRoot,
    description: 'Get a runtime environments configuration',
    onPremCommand: true,
    webDocs: {
        category: 'Runtime-Environments (On Prem)',
        title: 'Get Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environments name',
            })
            .positional('version', {
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
        const { name, version, history, extend, limit, offset, output } = argv;
        if (history) {
            const allHistory = await runtimeEnvironments.getRuntimeEnvironmentHistory({
                name,
            });
            console.log(JSON.stringify(allHistory, null, '\t'));

        }
        else if (name){
            const currruntimeEnvironments = await runtimeEnvironments.getRuntimeEvironmentsByName({
                name,
                version,
                extend,
            });
            specifyOutputForSingle(argv.output, currruntimeEnvironments);
        }
        else {
            specifyOutputForArray(output, await runtimeEnvironments.getAllRuntimeEnvironments({
                limit,
                offset,
            }));
        }
    },
});

module.exports = command;

