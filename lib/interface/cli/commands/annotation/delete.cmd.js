const Command = require('../../Command');
const _ = require('lodash');
const deleteRoot = require('../root/delete.cmd');
const Logic = require('./annotation.logic');

const command = new Command({
    parent: deleteRoot,
    command: 'annotation <entity-type> <entity-id> [labels...]',
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
        .example('codefresh delete annotation image 2dfacdaad466 coverage tests_passed', 'Delete specified annotations')
        .example('codefresh delete annotation image 2dfacdaad466', 'Delete all annotations of entity'),
    handler: async (argv) => {
        const { entityType, entityId, labels } = argv;

        await Logic.deleteAnnotations({ entityId, entityType, labels });
        console.log('Annotations was deleted');
    },
});

module.exports = command;
