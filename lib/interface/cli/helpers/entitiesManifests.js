const _ = require('lodash');
const CFError = require('cf-errors');
const { validatePipelineSpec, checkOrProjectExists } = require('./validation');
const { sdk } = require('../../../logic');

class EntitiesManifests {
    constructor({ name, data } = {}) {
        this.name = name;
        this.data = data;
    }

    createEntity(entity) {
        if (!EntitiesManifests._entities[entity]) {
            throw new CFError(`Entity: ${entity} not supported`);
        }
        return EntitiesManifests._entities[entity]({
            name: this.name,
            data: this.data,
        });
    }
}

EntitiesManifests._entities = {
    context: ({ data }) => sdk.contexts.create(data),
    'step-type': ({ data }) => sdk.steps.create(data),
    project: ({ name, data }) => checkOrProjectExists(name)
        .then(() => sdk.projects.create({ projectName: name, ..._.pick(data.metadata, ['tags', 'variables']) })),
    pipeline: ({ data }) => validatePipelineSpec(data)
        .then((result = {}) => (result.valid ? sdk.pipelines.create(data) : console.warn(result.message))),
};

EntitiesManifests.list = Object.keys(EntitiesManifests._entities);

module.exports = EntitiesManifests;
