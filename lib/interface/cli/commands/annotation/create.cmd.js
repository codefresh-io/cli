const _ = require('lodash');
const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const Logic = require('./annotation.logic');

const command = new Command({
    parent: createRoot,
    command: 'annotation <entity-type> <entity-id>',
    description: 'Annotate a resource with labels',
    webDocs: {
        category: 'Annotations',
        title: 'create',
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
        .option('name', {
            describe: 'Entity name',
            alias: 'n',
        })
        .option('label', {
            describe: 'Annotations',
            alias: 'l',
            required: true,
        })
        .example('codefresh create annotation image 2dfacdaad466 -n image_name -l coverage=75%', 'Annotate entity with a single label and name')
        .example('codefresh create annotation image 2dfacdaad466 -l coverage=75% -l tests_passed=true', 'Annotate entity with multiple labels'),
    handler: async (argv) => {
        const { 'entity-type': entityType, 'entity-id': entityId, name: entityName, label } = argv;

        // Wrap single value in array, skip if empty
        const labels = label && (_.isArray(label) ? label : [label]);

        await Logic.createAnnotations({ entityId, entityType, entityName, labels });
        console.log('Annotations was created');
    },
});

module.exports = command;
