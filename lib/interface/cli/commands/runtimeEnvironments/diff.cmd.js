const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const jsdiff = require('diff');
require('colors');




const diffRoot = require('../root/diff.cmd');


const command = new Command({
    command: 'runtime-environments [envNameOne] [envVersionOne] [envNameTwo] [envVersionTwo]',
    aliases: ['re', 'runtime-environment'],
    parent: diffRoot,
    description: 'Show diff between two runtime environments configuration',
    onPremCommand: true,
    webDocs: {
        category: 'Runtime-Environments (On Prem)',
        title: 'Diff Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('envNameOne', {
                describe: 'Runtime environments name',
            })
            .positional('envVersionOne', {
                describe: 'Runtime environments version',
            })
            .positional('envNameTwo', {
                describe: 'Runtime environments name',
            })
            .positional('envVersionTwo', {
                describe: 'Runtime environments version',
            });
    },
    handler: async (argv) => {
        const { envNameOne, envVersionOne, envNameTwo, envVersionTwo } = argv;
        const firstEnv = await runtimeEnvironments.getRuntimeEvironmentsByName({
            diff: true,
            name: envNameOne,
            version: envVersionOne,
        });

        const secondtEnv = await runtimeEnvironments.getRuntimeEvironmentsByName({
            diff: true,
            name: envNameTwo,
            version: envVersionTwo,
        });

        const firstEnvJson = JSON.stringify(firstEnv, null, '\t');
        const secondEnvJson = JSON.stringify(secondtEnv, null, '\t');

        const diff = jsdiff.diffJson(firstEnvJson, secondEnvJson);

        diff.forEach((part) => {
            // green for additions, red for deletions
            // blue for common parts
            const color = part.added ? 'green' : part.removed ? 'red' : 'white';
            process.stderr.write(part.value[color]);
        });

        console.log();
    },
});

module.exports = command;

