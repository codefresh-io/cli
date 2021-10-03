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
    const specTemplate = _.get(data, 'spec.specTemplate');
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
    if (specTemplate) {  // CR-6414 Using specTemplate - skip check spec/stages - they are not used
        return { valid: true, message: 'Using specTemplate' };
    }
    const validatedYaml = yaml.safeDump(yamlObj);
    const result = await sdk.pipelines.validateYaml({ yaml: validatedYaml, outputFormat: 'lint' });
    let message;
    if (result.summarize) {
        return {
            valid: !!result.valid,
            message: result.message,
            warning: result.warningMessage,
            summarize: result.summarize,
            documentationLinks: result.documentationLinks,
        };
    }
    if (!result.valid) {
        message = _buildFinalMessage('Provided spec is not valid', result.details);
    }
    return { valid: !!result.valid, message };
}

async function validatePipelineYaml(filename, fileContent) {
    const yamlContent = fileContent || await readFile(filename, 'UTF-8');
    const name = _getPipelineName(filename);
    const result = await sdk.pipelines.validateYaml({ yaml: yamlContent, name, outputFormat: 'lint' });
    let message;
    if (result.summarize) {
        return {
            valid: !!result.valid,
            message: result.message,
            warning: result.warningMessage,
            summarize: result.summarize,
            documentationLinks: result.documentationLinks,
        };
    }
    if (!result.valid) {
        message = _buildFinalMessage('Yaml not valid', result.details);
    }
    return { valid: !!result.valid, message };
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
