const _ = require('lodash');
const CFError = require('cf-errors');
const { validatePipelineSpec, checkOrProjectExists } = require('./validation');
const { sdk } = require('../../../logic');

module.exports = class EntitiesManifests {
    constructor({ name, data } = {}) {
        this.name = name;
        this.data = data;
        this._entities = {
            context: () => sdk.contexts.create(this.data),
            'step-type': () => sdk.steps.create(this.data),
            project: () => checkOrProjectExists(this.name)
                .then(() => sdk.projects.create({ projectName: this.name, ..._.pick(this.data.metadata, ['tags', 'variables']) })),
            pipeline: () => validatePipelineSpec(this.data)
                .then((result = {}) => (result.valid ? sdk.pipelines.create(this.data) : console.warn(result.message))),
        };
    }

    get entities() {
        return this._entities;
    }

    createEntity(name) {
        if (!this.entities[name]) {
            throw new CFError(`Entity: ${name} not supported`);
        }
        return this.entities[name]();
    }

    get entitiesList() {
        return Object.keys(this.entities);
    }
};
