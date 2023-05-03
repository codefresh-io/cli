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
        const {
            debug, skip, only, trigger, cpu, memory, branch, sha, disk,
        } = this.argv;
        const variablesFromFile = this.argv['var-file'];
        const pipelineName = this.argv.name;
        const noCache = this.argv['no-cache'];
        const runtimeName = this.argv['runtime-name'];
        const enableNotifications = this.argv['enable-notifications'];
        const resetVolume = this.argv['reset-volume'];
        const userYamlDescriptor = this.argv.yaml;
        const contexts = this.argv.context;
        const noCfCache = this.argv['no-cf-cache'];
        const packName = this.argv['pack-name'];

        if (process.env.CF_BUILD_ID) {
            this.argv.annotation.push(`cf_predecessor=${process.env.CF_BUILD_ID}`);
        }

        const annotations = prepareKeyValueFromCLIEnvOption(this.argv.annotation);
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
                skip,
                annotations,
                debug,
                cpu,
                memory,
                disk,
                runtimeName,
                packName,
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
        if (!pipelineName) {
            if (!userYamlDescriptor) {
                throw new CFError({
                    message: 'You need to specify pipelineName or the yaml file',
                });
            }
        } else {
            try {
                await sdk.pipelines.get({ name: pipelineName });
            } catch (err) {
                if (err.statusCode === 404) {
                    throw new CFError({
                        message: `Passed pipeline id: ${pipelineName} does not exist`,
                    });
                }

                throw err;
            }
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
