const _ = require('lodash');
const yaml = require('js-yaml');
const { readFile } = require('./general');
const { sdk } = require('../../../logic');


function _buildFinalMessage(baseMessage, validationResult) {
    if (_.isArray(validationResult.details)) {
        const errors = validationResult.details
            .map(({ message }) => `  - ${message}`)
            .join('\n');
        return `${baseMessage}:\n${errors}`;
    }
    return `${baseMessage}!`;
}

async function validatePipelineSpec(data) {
    const yamlObj = {
        version: data.version,
        ...data.spec.steps && { steps: data.spec.steps },
        ...data.spec.stages && { stages: data.spec.stages },
    };
    const validatedYaml = yaml.safeDump(yamlObj);
    const result = await sdk.pipelines.validateYaml({ yaml: validatedYaml });
    let message;
    if (!result.valid) {
        message = _buildFinalMessage('Provided spec is not valid', result);
    }
    return { valid: !!result.valid, message };
}

async function validatePipelineYaml(filename, fileContent) {
    const yamlContent = fileContent || await readFile(filename, 'UTF-8');
    const result = await sdk.pipelines.validateYaml({ yaml: yamlContent });
    let message;
    if (!result.valid) {
        message = _buildFinalMessage('Yaml not valid', result);
    }
    return { valid: !!result.valid, message };
}

module.exports = {
    validatePipelineSpec,
    validatePipelineYaml,
};
