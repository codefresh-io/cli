const _ = require('lodash');
const Command = require('../../Command');
const RuntimeEnvironmentsImages = require('../../../../logic/entities/RuntimeEnvironmentBaseImages');
const Output = require('../../../../output/Output');
require('../../defaults');
const CFError = require('cf-errors'); // eslint-disable-line
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');
require('../../../../logic/entities/Environment');

const command = new Command({
    command: 'runtime-environment-base-images [name]',
    aliases: ['re-base-images'],
    parent: getRoot,
    description: 'Get a runtime environment base images list that required by this runtime',
    webDocs: {
        category: 'Runtime-Environments-Base-Images',
        title: 'Get Runtime-Environment-Base-Images',
    },
    builder: (yargs) => yargs
        .positional('name', {
            describe: 'Runtime environment name',
        }),
    handler: async (argv) => {
        const { name } = argv;
        if (!name) {
            throw new CFError('Runtime Name must be provided');
        }
        const runtimeEnvImages = await sdk.runtimeEnvs.getBaseImages({
            name,
        });
        Output.print(_.map(runtimeEnvImages, RuntimeEnvironmentsImages.fromResponse));
    },
});


module.exports = command;
