const _ = require('lodash');
const yaml = require('js-yaml');
const path = require('path');
const { readFile, ignoreHttpError } = require('./general');
const { sdk } = require('../../../logic');
const CFError = require('cf-errors');


function _buildFinalMessage(baseMessage, validationResult) {
    if (_.isArray(validationResult)) {
        const errors = validationResult
            .map(({ message }) => `  - ${message}`)
            .join('\n');
        return `${baseMessage}:\n${errors}`;
    }
    return `${baseMessage}!`;
}

function _getPipelineName(filename) {
    if (filename) {
        return path.basename(filename, path.extname(filename));
    }
    return filename;
}

async function validatePipelineSpec(data) {
    const steps = _.get(data, 'spec.steps');
    const stages = _.get(data, 'spec.stages');
    const yamlObj = {};
    if (data.version) {
        yamlObj.version = data.version;
    }
    if (steps) {
        yamlObj.steps = steps;
    }
    if (stages) {
        yamlObj.stages = stages;
    }
    const validatedYaml = yaml.safeDump(yamlObj);
    const result = await sdk.pipelines.validateYaml({ yaml: validatedYaml });
    let message;
    if (!result.valid) {
        message = _buildFinalMessage('Provided spec is not valid', result.details);
    }
    return { valid: !!result.valid, message };
}

async function validatePipelineYaml(filename, fileContent) {
    const yamlContent = fileContent || await readFile(filename, 'UTF-8');
    const name = _getPipelineName(filename);
    const result = await sdk.pipelines.validateYaml({ yaml: yamlContent, name });
    let message;
    let warning;
    if (!result.valid) {
        message = _buildFinalMessage('Yaml not valid', result.details);
    }
    if (!_.isEmpty(result.warningDetails)) {
        warning = _buildFinalMessage('Yaml has warnings', result.warningDetails);
    }
    return { valid: !!result.valid, message, warning };
}

async function checkOrProjectExists(projectName) {
    const existing = await sdk.projects.getByName({ name: projectName }).catch(ignoreHttpError); // ignore not found error
    if (existing) {
        throw new CFError(`Project already exists: "${projectName}"`);
    }
}

module.exports = {
    validatePipelineSpec,
    validatePipelineYaml,
    checkOrProjectExists,
};
