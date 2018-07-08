const debug = require('debug')('codefresh:cli:create:context:git:gitlab');
const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const createGitCmd = require('./../base.cmd');
const {
    context,
} = require('../../../../../../../logic/index').api;

const LINK = 'https://gitlab.com/profile/personal_access_tokens';


const command = new Command({
    command: 'gitlab <name>',
    parent: createGitCmd,
    description: 'Create a gitlab context',
    usage: `${createGitCmd.usage}\nTo create gitlab context you need to generate the token here: ${LINK}`,
    webDocs: {
        category: 'Create Git Context',
        subCategory: 'gitlab',
        title: 'gitlab',
        weight: 10,
    },
    builder: (yargs) => {
        yargs
            .option('access-token', {
                describe: 'Access token from to be used to clone repositories',
                alias: 't',
                required: true,
            })
            .option('use-ssl', {
                describe: 'Connect to the git host using ssl',
                choices: [true, false],
                type: 'boolean',
                alias: 's',
                default: true,
                required: true,
            })
            .option('host', {
                describe: 'Host name of your gitlab (without protocol)',
                alias: 'h',
                default: 'gitlab.com',
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
                type: 'git.gitlab',
                data: {
                    sharingPolicy: argv.sharingPolicy,
                    host: argv.host || 'gitlab.com',
                    useSSL: Boolean(argv.useSSL) || true,
                    auth: {
                        type: 'basic',
                        username: 'oauth2',
                        password: argv.accessToken,
                    },
                },
            },
        };


        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }

        await context.createContext(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;
