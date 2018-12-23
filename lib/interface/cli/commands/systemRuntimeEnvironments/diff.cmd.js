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
        title: 'Diff System Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .option('first-name', {
                describe: 'First runtime environment name',
            })
            .option('first-version', {
                describe: 'First runtime environment version',
            })
            .option('first-plan', {
                describe: 'Plan of the first runtime environment (relevant only when it is a system plan runtime environment)',
            })
            .option('second-name', {
                describe: 'Second runtime environment name',
            })
            .option('second-version', {
                describe: 'Second runtime environment version',
            })
            .option('second-plan', {
                describe: 'Plan of the second runtime environment (relevant only when it is a system plan runtime environment)',
            });
    },
    handler: async (argv) => {
        const firstEnvName = argv['first-name'];
        const firstEnvVersion = argv['first-version'];
        const secondEnvName = argv['second-name'];
        const secondEnvVersion = argv['second-version'];
        const firstPlan = argv['first-plan'];
        const secondPlan = argv['second-plan'];

        const firstType = runtimeEnvironments.getRuntimeEnvironmentType(firstEnvName);
        const secondType = runtimeEnvironments.getRuntimeEnvironmentType(secondEnvName);

        const firstEnv = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
            diff: true,
            name: firstEnvName,
            version: firstEnvVersion,
            type: firstType,
            plan: firstPlan,
        });

        const secondtEnv = await runtimeEnvironments.getRuntimeEvironmentsByNameForAdmin({
            diff: true,
            name: secondEnvName,
            version: secondEnvVersion,
            type: secondType,
            plan: secondPlan,
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

