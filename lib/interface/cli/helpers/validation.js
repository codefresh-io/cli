const _ = require('lodash');
const yaml = require('js-yaml');
const { pipeline } = require('../../../logic').api;


async function validatePipelineFile(data) {
    const validatedYaml = yaml.safeDump(Object.assign({ version: data.version }, data.spec));
    const validationResult = await pipeline.validateYaml(validatedYaml);
    if (!validationResult.valid) {
        let finalMessage;
        if (_.isArray(validationResult.details)) {
            const errors = validationResult.details.map(({ message }) => `  - ${message}`).join('\n');
            finalMessage = `Provided spec is not valid:\n${errors}`;
        } else {
            finalMessage = 'Provided spec is not valid!';
        }
        throw new Error(finalMessage);
    }
}

module.exports = {
    validatePipelineFile,
};
