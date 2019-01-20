const debug = require('debug')('codefresh:cli:create:context:git:github');
const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const createGitCmd = require('./../base.cmd');
const {
    context,
} = require('../../../../../../../logic/index').api;

const LINK = 'https://github.com/settings/tokens';
const DEFAULT_API_HOST = 'api.github.com';
const DEFAULT_API_PREFIX = '/';

const command = new Command({
    command: 'github <name>',
    parent: createGitCmd,
    description: 'Create a github context',
    usage: `${createGitCmd.usage}\nTo create Github context you need to generate the token here: ${LINK}`,
    webDocs: {
        category: 'Create Git Context',
        subCategory: 'github',
        title: 'github',
        weight: 10,
    },
    builder: (yargs) => {
        yargs
            .option('access-token', {
                describe: 'Access token from to be used to clone repositories',
                alias: 't',
                required: true,
            })
            .option('host', {
                describe: 'Host name of your github (without protocol)',
                alias: 'h',
                default: DEFAULT_API_HOST,
                required: true,
            })
            .option('api', {
                describe: 'Prefix of the api on the given host',
                alias: 'a',
                default: DEFAULT_API_PREFIX,
                required: true,
            });
        return yargs;
    },
    handler: async (argv) => {
        const data = {
            apiVersion: 'v1',
            kind: 'context',
            metadata: {
                name: argv.name,
            },
            spec: {
                type: 'git.github',
                data: {
                    sharingPolicy: argv.sharingPolicy,
                    auth: {
                        type: 'basic',
                        password: argv.accessToken,
                    },
                },
            },
        };

        if (argv.apiPathPrefix !== DEFAULT_API_PREFIX) {
            data.spec.data.auth.apiPathPrefix = argv.apiPathPrefix;
        }

        if (argv.host !== DEFAULT_API_HOST) {
            data.spec.data.auth.apiHost = argv.host;
        }

        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }
        const opt = {};
        if (argv.skipValidation) {
            opt.skipValidation = true;
        }
        await context.createContext(data, opt);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;
