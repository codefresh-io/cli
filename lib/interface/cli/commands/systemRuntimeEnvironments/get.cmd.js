const Command = require('../../Command');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const Output = require('../../../../output/Output');
const DEFAULTS = require('../../defaults');



const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'system-runtime-environments [name]',
    aliases: ['sys-re','system-runtime-environment'],
    parent: getRoot,
    description: 'Get a runtime environments configuration',
    onPremCommand: true,
    webDocs: {
        title: 'Get System Runtime-Environments',
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
            .option('successors', {
                describe: 'Return all the successors of specific runtime environment',
                type: 'boolean',
                alias: 's',
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
            })
            .option('account', {
                describe: 'id of the account we want to view his runtime environments',
            })
            .option('accountIds', {
                describe: 'array of accounts ids to view theirs runtime environments',
                type: Array,
            });
    },
    handler: async (argv) => {
        const { name, version, history, extend, limit, page, plan, successors, account, accountIds } = argv;
        const offset = (page - 1) * limit;
        let type;
        if (name){
            type = runtimeEnvironments.getRuntimeEnvironmentType(name);
        }
        if (history) {
            const allHistory = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
                name,
                history,
                type,
                plan,
            });
            console.log(JSON.stringify(allHistory, null, '\t'));
        }
        else if (successors) {
            const allSuccessors = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
                name,
                successors,
                type,
                plan,
            });
            console.log(JSON.stringify(allSuccessors, null, '\t'));
        }
        else if (name) {
            const currRuntimeEnvironments = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
                name,
                version,
                extend,
                type,
                plan,
            });
            Output.print(currRuntimeEnvironments);
        }
        else {
            const re = await runtimeEnvironments.getAllRuntimeEnvironmentsForAdmin({
                limit,
                offset,
                account,
                accountIds,
            });
            Output.print(re);
        }
    },
});

module.exports = command;

