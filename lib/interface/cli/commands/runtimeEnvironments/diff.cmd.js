const Command = require('../../Command');
const jsdiff = require('diff');
require('colors');
const { sdk } = require('../../../../logic');

const diffRoot = require('../root/diff.cmd');


const command = new Command({
    command: 'runtime-environments [first-re-name] [first-re-version] [second-re-name] [second-re-version]',
    aliases: ['re', 'runtime-environment'],
    parent: diffRoot,
    description: 'Show diff between two runtime environments configuration',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Diff Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .option('first-name', {
                describe: 'First runtime environment name',
            })
            .option('first-version', {
                describe: 'First runtime environment version',
            })
            .option('second-name', {
                describe: 'Second runtime environment name',
            })
            .option('second-version', {
                describe: 'Second runtime environment version',
            });
    },
    handler: async (argv) => {
        const firstEnvName = argv['first-name'];
        const firstEnvVersion = argv['first-version'];
        const secondEnvName = argv['second-name'];
        const secondEnvVersion = argv['second-version'];

        const firstEnv = await sdk.runtimeEnvs.get({
            name: firstEnvName,
            version: firstEnvVersion,
        });

        const secondtEnv = await sdk.runtimeEnvs.get({
            name: secondEnvName,
            version: secondEnvVersion,
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

