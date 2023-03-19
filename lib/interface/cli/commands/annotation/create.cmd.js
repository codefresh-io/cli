const _ = require('lodash');
const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const Logic = require('./annotation.logic');

const command = new Command({
    parent: createRoot,
    command: 'annotation <entity-type> <entity-id> <labels...>',
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
        .positional('labels', {
            describe: 'Labels',
            required: true,
            array: true,
        }).options('display', {
            describe: 'annotation to disply on build',
        })
        .example('codefresh create annotation image 2dfacdaad466 coverage=75%', 'Annotate entity with a single label')
        .example('codefresh create annotation image 2dfacdaad466 coverage=75% tests_passed=true', 'Annotate entity with multiple labels'),
    handler: async (argv) => {
        const { entityType, entityId, labels, display } = argv;

        await Logic.createAnnotations({ entityId, entityType, labels, display });
        console.log('Annotations was created');
    },
});

module.exports = command;
