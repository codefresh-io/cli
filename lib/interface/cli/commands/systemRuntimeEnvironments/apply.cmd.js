const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const applyRoot = require('../root/apply.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const sysRe = require('../../helpers/sys-re');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'system-runtime-environments [name]',
    aliases: ['sys-re', 'system-runtime-environment'],
    parent: applyRoot,
    description: 'apply changes to runtime-environments resource',
    onPremCommand: true,
    usage: 'Use apply to patch an existing context',
    webDocs: {
        title: 'Apply System Runtime-Environments',
        weight: 90,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs
            .positional('name', {
                describe: 'Runtime environments name',
            })
            .option('default', {
                describe: 'Set the chosen runtime environment as default',
            })
            .option('extends', {
                describe: 'Set the runtime environments you want to extends from',
                type: Array,
                default: [],
            })
            .option('plan', {
                describe: 'Set the plan of system plan runtime environment',
            })
            .option('description', {
                alias: 'd',
                describe: 'Description of the new runtime environment',
            })
            .option('assign-accounts', {
                alias: 'a',
                type: Boolean,
                // default: false,
                describe: 'Assign runtime environment to accounts specified in the yaml',
            })
            .option('unassign-accounts', {
                alias: 'u',
                type: Boolean,
                // default: false,
                describe: 'Unassign runtime environment from accounts based on diff with current state',
            })
            .example('codefresh patch system-runtime-environments -f ./re.yml', 'Apply changes to a system runtime environment');
    },
    handler: async (argv) => {
        const options = {};
        const body = argv.filename || {};
        options.name = _.get(body, 'metadata.name') || argv.name;
        options.plan = _.get(body, 'plan') || argv.plan;
        options.extend = _.get(body, 'extends') || argv.extends;
        options.description = _.get(body, 'description') || argv.description;
        if (!options.name) {
            throw new CFError('Missing name in metadata');
        }
        if (argv.default) {
            try {
                await sysRe.setDefault(options);
                console.log(`Runtime-Environment: '${options.name}' set as a default.`);
            } catch (err) {
                throw (err);
            }
        } else {
            await sysRe.update(options, body);
            console.log(`Runtime-Environment: '${options.name}' patched.`);
            const yamlAccounts = body.accounts;
            if (yamlAccounts) {
                if (argv.unassignAccounts) {
                    const re = await sysRe.get({ ...options, extend: false });
                    const accounts = _.difference(re.accounts, yamlAccounts);
                    if (!_.isEmpty(accounts)) {
                        await sdk.onPrem.runtimeEnvs.account.delete({ name: options.name }, { accounts });
                        console.log(`Runtime-Environment unassigned from accounts: ${accounts}`);
                    } else {
                        console.log('No accounts to unassign');
                    }
                }

                if (argv.assignAccounts) {
                    const re = await sysRe.get({ ...options, extend: false });
                    const accounts = _.difference(yamlAccounts, re.accounts);
                    const existing = await sdk.accounts.listAccounts({ _id: accounts });
                    const nonExisting = _.difference(accounts, existing.map(({id}) => id));
                    if (!_.isEmpty(nonExisting)) {
                        throw new CFError({
                            message: `Accounts do not exist: ${nonExisting}`,
                        });
                    }
                    if (!_.isEmpty(accounts)) {
                        await sdk.onPrem.runtimeEnvs.account.modify({ name: options.name }, { accounts });
                        console.log(`Runtime-Environment assigned to accounts: ${accounts}`);
                    } else {
                        console.log('No accounts to assign');
                    }
                }
            }
        }
    },
});


module.exports = command;

