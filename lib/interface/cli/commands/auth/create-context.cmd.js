const Command = require('../../Command');
const DEFAULTS = require('../../defaults');
const { Config } = require('codefresh-sdk');
const authRoot = require('../root/auth.cmd');
const { sdk } = require('../../../../logic');
const { getConfigForSdk } = require('../../commad-line-interface');

const command = new Command({
    command: 'create-context [name]',
    parent: authRoot,
    description: 'Create or update an authentication context',
    usage: 'Creating authentication contexts enables the ability to work against multiple accounts',
    webDocs: {
        category: 'Authentication',
        title: 'Create Context',
        weight: 20,
    },
    builder: (yargs) => { // eslint-disable-line
        return yargs
            .option('url', {
                describe: 'Codefresh system custom url',
                default: DEFAULTS.URL,
            })
            .positional('name', {
                describe: 'Context name',
                default: 'default',
            })
            .option('api-key', {
                describe: 'API key',
                required: true,
            })
            .example('codefresh auth create-context --api-key KEY', 'Creating a default context using KEY as the api-key')
            .example('codefresh auth create-context my-context --api-key KEY', 'Creating a named context');
    },
    handler: async (argv) => {
        const configManager = Config.manager();
        await configManager.loadConfig({ configFilePath: argv.cfconfig });

        const updatedExistingContext = configManager.getContextByName(argv.name);

        const context = await configManager.createContext({ apiKey: argv.apiKey, url: argv.url, name: argv.name });
        configManager.addContext(context);
        configManager.setCurrentContext(context);
        await configManager.persistConfig();

        if (updatedExistingContext) {
            console.log(`Updated context: ${context.name}`);
        } else {
            console.log(`Created new context: ${context.name}`);
        }

        console.log(`Switched to context: ${context.name}`);
        const sdkConfig = await getConfigForSdk();
        sdk.configure(sdkConfig);
    },
});

module.exports = command;
