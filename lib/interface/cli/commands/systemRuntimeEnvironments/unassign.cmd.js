const CFError = require('cf-errors');
const _ = require('lodash');
const Command = require('../../Command');
const unassignRoot = require('../root/unassign.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'system-runtime-environments <name> <accounts..>',
    aliases: ['sys-re', 'system-runtime-environment'],
    parent: unassignRoot,
    description: 'Unassign system-runtime-environments from accounts',
    onPremCommand: true,
    usage: 'Use unassign to remove runtime environments from accounts by their name or id',
    webDocs: {
        title: 'Unassign System Runtime-Environments',
        weight: 90,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs
            .positional('name', {
                describe: 'Runtime environment name',
                required: true,
            })
            .positional('accounts', {
                describe: 'Accounts names',
                type: Array,
                required: true,
            })
            .example(
                'codefresh unassign sys-re my-sys-re acc1 acc2',
                'Remove system runtime enviroment "my-sys-re" from accounts acc1 and acc2',
            );
    },
    handler: async (argv) => {
        const { name, accounts: accountsNames } = argv;
        const accounts = await sdk.accounts.listAccounts({ name: accountsNames });
        const nonExistentAccounts = _.difference(accountsNames, accounts.map((a) => a.name));
        if (!_.isEmpty(nonExistentAccounts)) {
            throw new CFError({
                message: `Accounts do not exist: ${nonExistentAccounts}`,
            });
        }
        const accountIds = accounts.map((a) => a.id);
        await sdk.onPrem.runtimeEnvs.account.delete({ name }, { accounts: accountIds });
        console.log(`Successfully removed "${name}" from accounts: ${accountsNames}`);
    },
});

module.exports = command;
