const _ = require('lodash');
const Promise = require('bluebird');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { validatePipelineYaml } = require('../../helpers/validation');
const { printResult } = require('../root/validate.cmd');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');

class RunBaseCommand {
    constructor(argv) {
        this.argv = argv;
        this.executionRequests = [];
    }
    async run() {
        await this.preRunRequest();
        const variablesFromFile = this.argv['var-file'];
        const pipelineName = this.argv.name;
        const { branch, sha } = this.argv;
        const noCache = this.argv['no-cache'];
        const enableNotifications = this.argv['enable-notifications'];
        const resetVolume = this.argv['reset-volume'];
        const userYamlDescriptor = this.argv.yaml;
        const contexts = this.argv.context;
        const noCfCache = this.argv['no-cf-cache'];
        const trigger = this.argv['trigger'];
        const only = this.argv['only'];
        const skip = this.argv['skip'];

        const executionRequestTemplate = {
            pipelineName,
            options: {
                noCache,
                resetVolume,
                branch,
                sha,
                enableNotifications,
                userYamlDescriptor,
                noCfCache,
                trigger,
                only,
                skip
            },
        };
        if (variablesFromFile) {
            _.forEach(variablesFromFile, (variables) => {
                const request = _.cloneDeep(executionRequestTemplate);
                request.options.variables = variables;
                this.executionRequests.push(request);
            });
        } else {
            const variables = prepareKeyValueFromCLIEnvOption(this.argv.variable);
            const request = _.cloneDeep(executionRequestTemplate);
            request.options.variables = variables;
            request.options.contexts = contexts;
            this.executionRequests.push(request);
        }

        const results = await Promise.all(this.executionRequests.map(request => this.runImpl(request)));
        const findMaxReducer = (accumulator, currentValue) => (currentValue > accumulator ? currentValue : accumulator);
        const exitCode = results.reduce(findMaxReducer);
        await this.postRunRequest();
        return exitCode;
        // let p = Promise.resolve();
        // this.executionRequests.forEach(request => p = p.then(() => this.runImpl(request)));
        // await p;
    }

    // eslint-disable-next-line class-methods-use-this
    async runImpl() {
        throw new Error('To be implemented in the derived class');
    }
    // eslint-disable-next-line class-methods-use-this
    async preRunAll() {
        const pipelineName = this.argv.name;
        const userYamlDescriptor = this.argv.yaml;
        const contexts = this.argv.context;
        try {
            await sdk.pipelines.get({ name: pipelineName });
        } catch (err) {
            throw new CFError({
                message: `Passed pipeline id: ${pipelineName} does not exist`,
            });
        }

        if (userYamlDescriptor) {
            const result = await validatePipelineYaml(undefined, userYamlDescriptor);
            printResult(result);
            if (result && !result.valid) {
                throw new Error(result);
            }
        }

        if (!_.isEmpty(contexts)) {
            await Promise.map(contexts, async (name) => { // eslint-disable-line
                try {
                    await sdk.contexts.get({ name });
                } catch (err) {
                    throw new CFError(err, `Failed to verify context ${name} with error: ${err.message}`);
                }
            });
        }
    }
    // eslint-disable-next-line class-methods-use-this
    get isParalel() {
        return true;
    }
    // eslint-disable-next-line class-methods-use-this
    async preRunRequest() {
        return Promise.resolve();
    }
    // eslint-disable-next-line class-methods-use-this
    async postRunRequest() {
        return Promise.resolve();
    }
    // eslint-disable-next-line class-methods-use-this
    async postRunAll() {
        return Promise.resolve();
    }
}
module.exports = RunBaseCommand;
