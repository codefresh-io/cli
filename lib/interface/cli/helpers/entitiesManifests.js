const _ = require('lodash');
const CFError = require('cf-errors');
const { validatePipelineSpec, checkOrProjectExists } = require('./validation');
const { sdk } = require('../../../logic');
const { createAnnotations } = require('../commands/annotation/annotation.logic');

function _basicValidation({ name }) {
    if (!name) {
        throw new CFError('Name is missing');
    }
}

const _entities = {

    context: {
        validate: _basicValidation,
        create: ({ data }) => sdk.contexts.create(data),
    },
    'step-type': {
        validate: _basicValidation,
        create: ({ data }) => sdk.steps.create(data),
    },
    project: {
        validate: _basicValidation,
        create: ({ name, data }) => checkOrProjectExists(name)
            .then(() => sdk.projects.create({ projectName: name, ..._.pick(data.metadata, ['tags', 'variables']) })),
    },
    pipeline: {
        validate: _basicValidation,
        create: ({ data }) => validatePipelineSpec(data)
            .then((result = {}) => (result.valid ? sdk.pipelines.create(data) : console.warn(result.message))),
    },
    annotation: {
        create: ({ data }) => {
            const labels = _.get(data.metadata, 'labels', [])
                .map(({ key, value }) => `${key}=${value}`);
            return createAnnotations({ labels, ..._.pick(data.metadata, ['entityId', 'entityType']) });
        },
    },
};

const entityList = Object.keys(_entities);

function createEntity(options) {
    const { entity } = options;
    if (!_entities[entity]) {
        throw new CFError(`Entity: ${entity} not supported`);
    }

    if (_entities[entity].validate instanceof Function) {
        _entities[entity].validate(options);
    }

    return _entities[entity].create(options);
}

module.exports = {
    createEntity,
    entityList,
};
