const _ = require('lodash');
const { validatePipelineSpec, checkOrProjectExists } = require('./validation');
const { sdk } = require('../../../logic');

module.exports = ({ name, data }) => ({

    context: () => sdk.contexts.create(data),
    'step-type': () => sdk.steps.create(data),
    project: () => checkOrProjectExists(name)
        .then(() => sdk.projects.create({ projectName: name, ..._.pick(data.metadata, ['tags', 'variables']) })),
    pipeline: () => validatePipelineSpec(data)
        .then((result = {}) => (result.valid ? sdk.pipelines.create(data) : console.warn(result.message))),

});
