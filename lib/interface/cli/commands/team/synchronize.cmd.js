const _ = require('lodash');
const Command = require('../../Command');
const syncRoot = require('../root/synchronize.cmd');
const { sdk } = require('../../../../logic');
const cliConfigManager = require('../../../../logic/cli-config/Manager');
const Spinner = require('ora');
const CFError = require('cf-errors');

const REQUEST_TIMEOUT = 2 * 60 * 1000;

const command = new Command({
    command: 'teams [client-name]',
    aliases: ['team', 'tm'],
    parent: syncRoot,
    description: 'Synchronize team with group',
    webDocs: {
        category: 'Teams',
        title: 'Synchronize Teams',
    },
    builder: (yargs) => {
        return yargs
            .positional('client-name', {
                describe: 'Client name',
                alias: 'n',
                required: true,
            })
            .option('client-type', {
                describe: 'Client type like github, okta, azure',
                alias: 't',
                required: true,
            })
            .option('access-token', {
                describe: 'Github Personal Access Token that overrides the default one (Optional and only valid for Github)',
                alias: 'tk',
                required: false,
            })
            .option('disable-notifications', {
                describe: 'Disable build result email notifications for new users (User Settings > Notifications)',
                alias: 'no-notify',
                required: false,
                type: 'boolean',
                default: false,
            })
            .example('codefresh synchronize teams [client-name] -t [client-type] --tk [accessToken]', 'Synchronize team with group');
    },
    handler: async (argv) => {
        const clientType =  _.isArray(argv['client-type']) ? _.head(argv['client-type']) : argv['client-type'];

        const config = cliConfigManager.config();
        if (!_.isInteger(argv.requestTimeout) || config.request.timeout < REQUEST_TIMEOUT) {
            _.set(sdk, 'config.http.config.timeout', REQUEST_TIMEOUT);
        }

        if (clientType === 'github' && !argv['access-token']) {
            throw new CFError('access-token should be provided in case if client-type is "github"');
        }

        const spinner = Spinner().start('Synchronizing...');
        let result;
        try {
            result = await sdk.teams.synchronizeClientWithGroup({
                name: argv['client-name'],
                type: clientType,
                access_token: argv['access-token'],
                disableNotifications: argv['disable-notifications']
            });
        } finally {
            spinner.stop();
        }
        console.log(JSON.stringify(result, null, 2));
    },
});


module.exports = command;

