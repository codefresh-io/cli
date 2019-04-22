const Command = require('../../Command');
const _ = require('lodash');
const deleteRoot = require('../root/delete.cmd');
const Logic = require('./annotation.logic');

const command = new Command({
    parent: deleteRoot,
    command: 'annotation <entity-type> <entity-id>',
    description: 'Delete annotations',
    webDocs: {
        category: 'Annotations',
        title: 'delete',
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
        .example('codefresh delete annotation image 2dfacdaad466 -l coverage -l tests_passed', 'Delete annotations')
        .example('codefresh delete annotation image 2dfacdaad466', 'Delete all annotations of entity'),
    handler: async (argv) => {
        const { 'entity-type': entityType, 'entity-id': entityId, label } = argv;

        // Wrap single value in array, skip if empty
        const labels = label && (_.isArray(label) ? label : [label]);

        await Logic.deleteAnnotations({ entityId, entityType, labels });
        console.log('Annotations was deleted');
    },
});

module.exports = command;
