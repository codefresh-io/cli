const _ = require('lodash');
const Command = require('../../Command');
const deleteCmd = require('../root/delete.cmd');
const { token } = require('../../../../logic').api;


const command = new Command({
    command: 'tokens [names|ids..]',
    aliases: ['token'],
    parent: deleteCmd,
    description: 'Revoke Codefresh token',
    webDocs: {
        category: 'Tokens',
        title: 'Delete tokens',
    },
    builder: (yargs) => {
        yargs
            .positional('names', {
                describe: 'token names or ids',
                required: true,
            })
            .example('codefresh create token --subject my-k8s-cluster/namespace --name new-token', 'Create token form runtime environment');
    },
    handler: async (argv) => {
        if (_.isEmpty(argv.names)) {
            console.log('Token names or ids must be provided');
            return;
        }

        let tokens = await token.getTokens();
        const namesAndIds = tokens.reduce((set, t) => {
            set.add(t.info.id);
            set.add(t.info.name);
            return set;
        }, new Set());

        const names = argv.names.filter((n) => {
            const found = namesAndIds.has(n);
            if (!found) {
                console.log(`Not found: ${n}`);
            }
            return found;
        });

        tokens = tokens.filter(t => names.includes(t.info.name) || names.includes(t.info.id));

        const promises = tokens.map(t => token.deleteToken(t.info.id).then(() => console.log(`Deleted token: ${t.info.name}`)));
        await Promise.all(promises);
    },
});

module.exports = command;

