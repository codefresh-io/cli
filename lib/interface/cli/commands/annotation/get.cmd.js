const _ = require('lodash');
const Command = require('../../Command');
const Logic = require('./annotation.logic');
const Annotation = require('../../../../logic/entities/Annotation');
const Output = require('../../../../output/Output');

const getRoot = require('../root/get.cmd');

const command = new Command({
    parent: getRoot,
    command: 'annotation <entity-type> <entity-id> [labels...]',
    description: 'Get annotations',
    webDocs: {
        category: 'Annotations',
        title: 'get',
        // weight: 50,
    },
    builder: yargs => yargs
        .positional('entity-type', {
            describe: 'Type of resource for annotation',
            required: true,
        })
        .positional('entity-id', {
            describe: 'Id of resource for annotation',
            required: true,
        })
        .positional('labels', {
            describe: 'Labels to filter by',
            array: true,
            default: [],
        })
        .example('codefresh get annotation image 2dfacdaad466', 'Get all annotations for entity')
        .example('codefresh get annotation image 2dfacdaad466 coverage tests_passed', 'Get specified annotations'),
    handler: async (argv) => {
        const { entityType, entityId, labels } = argv;

        const annotations = await Logic.listAnnotations({ entityId, entityType, labels });
        Output.print(annotations.map(Annotation.fromResponse));
    },
});

module.exports = command;
