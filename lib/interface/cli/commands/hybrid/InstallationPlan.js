/* eslint-disable no-await-in-loop */
const installationProgress = require('./installation-process');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const colors = require('colors');

class InstallationPlan {
    constructor({ steps, progressReporter, errHandler }) {
        this.steps = steps || [];
        this.progressReporter = progressReporter;
        this.errHandler = errHandler;
    }

    addStep({
        name,
        func,
        args,
        arg,
        errMessage,
        successMessage,
        installationEvent,
        exitOnError = true,
    }) {
        this.steps.push({
            name,
            func,
            args,
            arg,
            errMessage,
            successMessage,
            installationEvent,
            exitOnError,
        });
    }

    async execute() {
        while (this.steps.length) {
            const {
                name,
                func,
                args,
                arg,
                errMessage,
                successMessage,
                installationEvent,
                exitOnError,
            } = this.steps.shift();
            const _args = args || [arg];

            if (name) {
                console.log(`executing step: ${colors.cyan(name)}`);
            }

            const [stepErr] = await to(func(..._args));
            if (stepErr) {
                await this.errHandler(stepErr, errMessage, this.progressReporter, installationEvent, exitOnError);
            } else {
                if (successMessage) {
                    console.log(successMessage);
                }
                if (installationEvent) {
                    await to(this.progressReporter.report(installationEvent, installationProgress.status.SUCCESS));
                }
            }
        }
    }

    getPlan() {
        return this.steps;
    }
}

module.exports = InstallationPlan;
