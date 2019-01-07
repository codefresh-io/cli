const _ = require('lodash');
const Promise = require('bluebird');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline, log } = require('../../../../logic').api;
const { validatePipelineYaml } = require('../../helpers/validation');
const { printResult } = require('../root/validate.cmd');
const CFError = require('cf-errors');

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

        const executionRequestTemplate = {
            pipelineName,
            options: {
                noCache,
                resetVolume,
                branch,
                sha,
                enableNotifications,
                userYamlDescriptor,
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
        if (this.isParalel) {
            const results = await Promise.all(this.executionRequests.map(request => this.runImpl(request)));
            const exitCode = results.find(code => code > 0);
            return exitCode || 0;
        }
        let exitCode = 0;
        try {
            exitCode = await Promise.resolve(this.executionRequests).map(this.runImpl.bind(this), { concurrency: 1 });
        } catch (error) {
            exitCode = 1;
        }
        await this.postRunRequest();
        const findMaxReducer = (accumulator, currentValue) => (currentValue > accumulator ? currentValue : accumulator);
        return exitCode.reduce(findMaxReducer);
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
        try {
            await pipeline.getPipelineByName(pipelineName);
        } catch (err) {
            throw new CFError({
                message: `Passed pipeline id: ${pipelineName} does not exist`,
            });
        }

        if (userYamlDescriptor) {
            const result = await validatePipelineYaml(undefined, userYamlDescriptor);
            printResult(result);
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
    async writeToLog(workflowId) {
        if (this.executionRequests.length === 1) {
            if (this.argv.detach) {
                console.log(workflowId);
            } else {
                await log.showWorkflowLogs(workflowId, true);
            }
        } else {
            console.log(workflowId);
        }
    }
}
module.exports = RunBaseCommand;
