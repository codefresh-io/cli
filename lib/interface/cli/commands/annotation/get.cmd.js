const _ = require('lodash');
const Command = require('../../Command');
const Logic = require('./annotation.logic');

const getRoot = require('../root/get.cmd');

const command = new Command({
    parent: getRoot,
    command: 'annotation <entity-type> <entity-id>',
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
        .option('label', {
            describe: 'Annotations',
            alias: 'l',
        })
        .example('codefresh get annotation image 2dfacdaad466', 'Get all annotations for entity')
        .example('codefresh annotate image 2dfacdaad466 -l coverage', 'Get specified annotation'),
    handler: async (argv) => {
        const { 'entity-type': entityType, 'entity-id': entityId, label } = argv;

        // Wrap single value in array, skip if empty
        const labels = label && (_.isArray(label) ? label : [label]);

        const annotations = await Logic.listAnnotations({ entityId, entityType, labels });
        if (annotations && annotations.length) {
            console.log(
                'Annotations for',
                `${annotations[0].entityType} "${annotations[0].entityId}"`,
                annotations[0].entityName ? `with name "${annotations[0].entityName}"` : '',
            );
            console.log(annotations.map(annotation => `${annotation.key} = ${annotation.value}`).join('\n'));
        } else {
            console.error('Annotations not found');
        }
    },
});

module.exports = command;
