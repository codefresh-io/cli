const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const jsdiff = require('diff');
require('colors');

const diffRoot = require('../root/diff.cmd');


const command = new Command({
    command: 'system-runtime-environments [first-re-name] [first-re-version] [second-re-name] [second-re-version]',
    aliases: ['sys-re','system-runtime-environment'],
    parent: diffRoot,
    description: 'Show diff between two runtime environments configuration',
    onPremCommand: true,
    webDocs: {
        category: 'Runtime-Environments (On Prem)',
        title: 'Diff Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('first-re-name', {
                describe: 'Runtime environments name',
            })
            .positional('first-re-version', {
                describe: 'Runtime environments version',
            })
            .positional('second-re-name', {
                describe: 'Runtime environments name',
            })
            .positional('second-re-version', {
                describe: 'Runtime environments version',
            });
    },
    handler: async (argv) => {
        const firstEnvName = argv['first-re-name'];
        const firstEnvVersion = argv['first-re-version'];
        const secondEnvName = argv['second-re-name'];
        const secondEnvVersion = argv['second-re-version'];
        const firstType = runtimeEnvironments.getRuntimeEnvironmentType(firstEnvName);
        const secondType = runtimeEnvironments.getRuntimeEnvironmentType(secondEnvName);

        const firstEnv = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
            diff: true,
            name: firstEnvName,
            version: firstEnvVersion,
            type: firstType,
        });

        const secondtEnv = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
            diff: true,
            name: secondEnvName,
            version: secondEnvVersion,
            type: secondType,
        });

        const firstEnvJson = JSON.stringify(firstEnv, null, '\t');
        const secondEnvJson = JSON.stringify(secondtEnv, null, '\t');

        const diff = jsdiff.diffJson(firstEnvJson, secondEnvJson);

        diff.forEach((part) => {
            const color = part.added ? 'green' : part.removed ? 'red' : 'white';
            process.stderr.write(part.value[color]);
        });

        console.log();
    },
});

module.exports = command;

