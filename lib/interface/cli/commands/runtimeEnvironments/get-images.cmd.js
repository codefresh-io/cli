const _ = require('lodash');
const Command = require('../../Command');
const RuntimeEnvironmentsImages = require('../../../../logic/entities/RuntimeEnvironmentsImages');
const Output = require('../../../../output/Output');
require('../../defaults');
const CFError = require('cf-errors'); // eslint-disable-line
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');
require('../../../../logic/entities/Environment');

const command = new Command({
    command: 'runtime-environments-images [name]',
    aliases: ['re-images'],
    parent: getRoot,
    description: 'Get a runtime environments images list that required by this runtime', // todo: edit description
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Get Runtime-Environments-Images',
    },
    builder: (yargs) => yargs
        .positional('name', {
            describe: 'Runtime environments name',
        }),
    handler: async (argv) => {
        const { name } = argv;
        if (!name) {
            throw new CFError('Runtime Name must be provided');
        }
        const runtimeEnvImages = await sdk.runtimeEnvs.getImages({
            name,
        });
        Output.print(_.map(runtimeEnvImages, RuntimeEnvironmentsImages.fromResponse));
    },
});

module.exports = command;
