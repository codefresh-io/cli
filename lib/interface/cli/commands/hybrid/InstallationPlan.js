/* eslint-disable no-await-in-loop */
const _ = require('lodash');
const installationProgress = require('./installation-process');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const colors = require('colors');
const {
    resolve, join,
} = require('path');
const {
    homedir,
} = require('os');
const {
    existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync,
} = require('fs');

const CODEFRESH_PATH = resolve(homedir(), '.Codefresh');
const RUNNER_INSTALLATIONS_PATH = join(CODEFRESH_PATH, 'installations');
const INSTALLATION_STATE_FILE_PATH = join(RUNNER_INSTALLATIONS_PATH, 'installation_state.json');
const STEP_STATUSES = {
    SUCCESS: 'success',
    FAILURE: 'failure',
    PENDING: 'pending',
    SKIPPED: 'skipped',
};

function _ensureDirectory(location) {
    if (!existsSync(location)) {
        mkdirSync(location);
    }
}

class InstallationPlan {
    constructor({
        pendingSteps,
        finishedSteps,
        progressReporter,
        errHandler,
        context,
    }) {
        this.state = {
            pendingSteps: pendingSteps || [],
            finishedSteps: finishedSteps || [],
            context: context || {},
        };
        this.completedSteps = {}; // used for fast lookup of completed steps
        this.progressReporter = progressReporter;
        this.errHandler = errHandler;
        _ensureDirectory(RUNNER_INSTALLATIONS_PATH);
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
        condition = true,
    }) {
        if (!this.completedSteps[name]) {
            this.state.pendingSteps.push({
                name,
                func,
                args,
                arg,
                errMessage,
                successMessage,
                installationEvent,
                exitOnError,
                condition,
                status: STEP_STATUSES.PENDING,
            });
        }
    }

    reset() {
        this.state.finishedSteps = this.state.finishedSteps.filter((step) => {
            if (step.status === STEP_STATUSES.SUCCESS || step.status === STEP_STATUSES.SKIPPED) {
                this.completedSteps[step.name] = step;
                return true;
            }
            return false;
        });

        this.state.pendingSteps = [];
    }

    async execute() {
        while (this.state.pendingSteps.length) {
            const step = this.state.pendingSteps.shift();
            this.state.finishedSteps.push(step);
            const _args = step.args || [step.arg];

            if (!step.condition || (_.isFunction(step.condition) && !await step.condition())) {
                console.log(`skipping step: ${colors.cyan(step.name)}`);
                step.status = STEP_STATUSES.SKIPPED;
                this._writeState();
                // eslint-disable-next-line no-continue
                continue;
            }

            if (step.name) {
                console.log(`executing step: ${colors.cyan(step.name)}`);
            }

            const [stepErr] = await to(step.func(..._args));
            if (stepErr) {
                step.status = STEP_STATUSES.FAILURE;
                this._writeState();
                await this.errHandler(
                    stepErr,
                    step.errMessage || `Failed to ${step.name}`,
                    this.progressReporter, step.installationEvent,
                    step.exitOnError,
                );
            } else {
                step.status = STEP_STATUSES.SUCCESS;
                this._writeState();
                if (step.successMessage) {
                    console.log(step.successMessage);
                }
                if (step.installationEvent && this.progressReporter) {
                    await to(this.progressReporter.report(step.installationEvent, installationProgress.status.SUCCESS));
                }
            }
        }

        InstallationPlan._cleanup();
    }

    setProgressReporter(progressReporter) {
        this.progressReporter = progressReporter;
    }

    setErrorHandler(errHandler) {
        this.errHandler = errHandler;
    }

    addContext(key, value) {
        this.state.context[key] = value;
    }

    getContext(key) {
        return this.state.context[key];
    }

    _writeState() {
        writeFileSync(INSTALLATION_STATE_FILE_PATH, JSON.stringify(this.state));
    }

    static _cleanup() {
        try {
            unlinkSync(INSTALLATION_STATE_FILE_PATH);
        } catch (err) {
            console.warn('** could not delete installation state file **');
        }
    }

    static restorePreviousState() {
        try {
            const data = readFileSync(join(RUNNER_INSTALLATIONS_PATH, 'installation_state.json'));
            const oldState = JSON.parse(data.toString('utf-8'));
            return new InstallationPlan({ ...oldState });
        } catch (err) {
            return undefined;
        }
    }

    printState() {
        this.state.finishedSteps.forEach((step) => {
            if (step.status === STEP_STATUSES.SUCCESS) {
                console.log(`${colors.green('✓')} ${step.name}`);
            } else if (step.status === STEP_STATUSES.SKIPPED) {
                console.log(`${colors.cyan('⤳')} ${step.name}`);
            } else if (step.status === STEP_STATUSES.FAILURE) {
                console.log(`${colors.red('✘')} ${step.name}`);
            }
        });

        this.state.pendingSteps.forEach((step) => {
            console.log(`${colors.white('◼')} ${step.name}`);
        });
    }
}

module.exports = InstallationPlan;
