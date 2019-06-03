const Command = require('../../Command');
const _ = require('lodash');
const RuntimeEnvironments = require('../../../../logic/entities/RuntimeEnvironments');
const Output = require('../../../../output/Output');
const DEFAULTS = require('../../defaults');
const sysRe = require('../../helpers/sys-re');

const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'system-runtime-environments [name]',
    aliases: ['sys-re', 'system-runtime-environment'],
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
                array: true,
                default: [],
            });
    },
    handler: async (argv) => {
        const { name, version, history, extend, limit, page, plan, successors, account, accountIds } = argv;
        const offset = (page - 1) * limit;
        if (history) {
            const allHistory = await sysRe.get({
                name,
                history,
                plan,
            });
            console.log(JSON.stringify(allHistory, null, '\t'));
        } else if (successors) {
            const allSuccessors = await sysRe.get({
                name,
                successors,
                plan,
            });
            console.log(JSON.stringify(allSuccessors, null, '\t'));
        } else if (name) {
            const currRuntimeEnvironments = await sysRe.get({
                name,
                version,
                extend,
                plan,
            });
            Output.print(RuntimeEnvironments.fromResponse(currRuntimeEnvironments));
        } else {
            let re = await sysRe.list({
                limit,
                offset,
                account,
                accountIds: accountIds,
            });
            if (!_.isEmpty(accountIds)) {
                re = _.flatten(_.map(re, ({ runtimeEnvironments }) => runtimeEnvironments));
            }
            Output.print(_.map(re, RuntimeEnvironments.fromResponse));
        }
    },
});

module.exports = command;

