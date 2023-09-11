const CFError = require('cf-errors');
const _ = require('lodash');
const Command = require('../../Command');
const assignRoot = require('../root/assign.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'system-runtime-environments <name> <accounts..>',
    aliases: ['sys-re', 'system-runtime-environment'],
    parent: assignRoot,
    description: 'Assign system-runtime-environments to accounts',
    onPremCommand: true,
    usage: 'Use assign to add runtime environments to accounts by their name or id',
    webDocs: {
        title: 'Assign System Runtime-Environments',
        weight: 90,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs
            .positional('name', {
                describe: 'Runtime environments name',
                required: true,
            })
            .positional('accounts', {
                describe: 'Accounts names',
                type: Array,
                required: true,
            })
            .example(
                'codefresh assign sys-re my-sys-re acc1 acc2',
                'Add system runtime enviroment "my-sys-re" to accounts acc1 and acc2'   ,
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
        await sdk.onPrem.runtimeEnvs.account.modify({ name }, { accounts: accountIds });
        console.log(`Successfully assigned "${name}" to accounts: ${accountsNames}`);
    },
});

module.exports = command;
