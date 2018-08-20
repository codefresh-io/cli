const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const DEFAULTS = require('../../defaults');



const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'system-runtime-environments [name]',
    aliases: ['sys-re','system-runtime-environment'],
    parent: getRoot,
    description: 'Get a runtime environments configuration',
    onPremCommand: true,
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
            })
            .option('plan', {
                describe: 'Set the plan of system plan runtime environment',
            });
    },
    handler: async (argv) => {
        const { name, version, history, extend, limit, page, output, plan } = argv;
        const offset = (page - 1) * limit;
        const type = runtimeEnvironments.getRuntimeEnvironmentType(name);
        if (history) {
            const allHistory = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
                name,
                history,
                type,
                plan,
            });
            console.log(JSON.stringify(allHistory, null, '\t'));

        }
        else if (name) {
            const currruntimeEnvironments = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
                name,
                version,
                extend,
                type,
                plan,
            });
            specifyOutputForSingle(argv.output, currruntimeEnvironments);
        }
        else {
            specifyOutputForArray(output, await runtimeEnvironments.getAllRuntimeEnvironmentsForAdmin({
                limit,
                offset,
            }));
        }
    },
});

module.exports = command;

