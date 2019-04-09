/* eslint-disable no-use-before-define,object-curly-newline,arrow-body-style */

const _ = require('lodash');
const Command = require('../../Command');
const { sdk } = require('../../../../logic');

const annotate = new Command({
    root: true,
    command: 'annotate <command> <entity-type> <entity-id>',
    description: 'Annotate a resource with labels',
    webDocs: {
        category: 'Annotations',
        title: 'annotate',
        weight: 50,
    },
    builder: yargs => yargs
        .positional('command', {
            describe: 'Command: set, unset, list',
            required: true,
        })
        .positional('entity-type', {
            describe: 'Type of resource for annotation',
            required: true,
        })
        .positional('entity-id', {
            describe: 'Id of resource for annotation',
            required: true,
        })
        .option('unset', {
            describe: 'Unset annotations',
            alias: 'u',
        })
        .option('label', {
            describe: 'Annotations',
            alias: 'l',
        })
        .choices('command', ['set', 'unset', 'list'])
        .example('codefresh annotate image 2dfacdaad466 -l coverage=75%', 'Annotate an image with a single label')
        .example('codefresh annotate image 2dfacdaad466 -l coverage=75% -l tests_passed=true', 'Annotate an image with multiple labels')
        .example('codefresh annotate image 2dfacdaad466 -u -l coverage -l tests_passed', 'Unset annotations'),
    handler: async (argv) => {
        const { 'entity-type': entityType, 'entity-id': entityId, label, command } = argv;

        // Wrap single value in array, skip if empty
        const labels = label && (_.isArray(label) ? label : [label]);

        switch (command) {
            case 'set': return setAnnotations({ entityId, entityType, labels });
            case 'unset': return unsetAnnotations({ entityId, entityType, labels });
            case 'list': return listAnnotations({ entityId, entityType, labels });
            default: return null;
        }
    },
});

async function listAnnotations({ entityId, entityType, labels }) {
    let annotations = [];
    try {
        annotations = await sdk.annotations.list({ entityId, entityType });
    } catch (error) {
        if (error.statusCode === 404) {
            console.error('Annotations not found for specified entity');
        } else {
            console.error(error.message);
        }
        return;
    }

    if (labels) {
        annotations = annotations.filter(annotation => labels.includes(annotation.key));
    }

    if (annotations.length) {
        console.log('Annotations:');
        console.log(annotations.map(annotation => `${annotation.key} = ${annotation._value}`)
            .join('\n'));
    } else {
        console.error('Annotations not found');
    }
}

function setAnnotations({ entityId, entityType, labels }) {
    if (!labels) {
        console.error('"label" option is required for set command');
        return Promise.resolve();
    }

    const annotations = parseAnnotations(labels);
    const requests = annotations.map(({ key, value }) => {
        return sdk.annotations.create({ entityId, entityType, key, value });
    });

    return Promise.all(requests);
}

function unsetAnnotations({ entityId, entityType, labels }) {
    if (labels) {
        const requests = labels.map((key) => {
            return sdk.annotations.delete({ entityId, entityType, key });
        });
        return Promise.all(requests);
    }

    return sdk.annotations.delete({ entityId, entityType });
}

function parseAnnotations(labels) {
    return labels.map((label) => {
        const [key, value] = label.split('=');
        return { key, value };
    });
}

module.exports = annotate;
