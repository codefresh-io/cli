const Docker = require('dockerode');
const RunBaseCommand = require('./run.base');
const path = require('path');
const DEFAULTS = require('../../defaults');
const authManager = require('../../../../logic').auth.manager;
const _ = require('lodash');
const { log } = require('../../../../logic').api;
const chalk = require('chalk');

const regex = /##[0-9a-f]{24}##/i;

function _customizer(objValue, srcValue) {
    if (Array.isArray(objValue)) {
        return _.compact(objValue.concat(srcValue));
    }
}

class RunLocalCommand extends RunBaseCommand {
    constructor(argv) {
        super(argv);
        this.docker = new Docker();
    }
    async preRunAll() {
        await super.preRunAll();
        console.log('Updating Codefresh engine ==>');
        return new Promise((resolve, reject) => {
            this.docker.pull(DEFAULTS.ENGINE_IMAGE, (err, stream) => {
                if (err) {
                    console.log(`Failed to update codefresh engine: \n ${err}`);
                    reject(err);
                }
                this.docker.modem.followProgress(stream, onFinished, onProgress);

                function onFinished(error) {
                    if (error) {
                        reject(error);
                    }
                    console.log('Finished Update.\n');
                    resolve(undefined);
                }

                function onProgress(res) {
                    if (_.get(res, 'status')) {
                        console.log(res.status);
                    }
                }
            });
        });
    }
    async runImpl(request) {
        const { pipelineName } = request;
        const { branch, userYamlDescriptor, variables } = request.options;
        const localVolume = this.argv['local-volume'] === true ?
            path.join(DEFAULTS.CODEFRESH_PATH, pipelineName) : this.argv['local-volume'];
        const injectedOpts = {};
        // TODO : Move to per command's handler so each command will be handled in a seperate handler
        if (userYamlDescriptor) {
            injectedOpts.Env = [`OVERRIDE_WORKFLOW_YAML=${userYamlDescriptor}`];
        }
        if (localVolume) {
            injectedOpts.Env = [`EXTERNAL_WORKSPACE=${localVolume}`];
            console.log(`\nUsing ${localVolume} as a local volume.\n`);
        }

        if (variables) {
            const envVars = Object.keys(variables).reduce((sum, key) => sum += `${key.trim()}=${variables[key]},`, '');
            injectedOpts.Env = [`VARIABLES=${envVars.slice(0, envVars.length - 1)}`];
        }

        const currentContext = authManager.getCurrentContext();
        console.log(`Running pipeline: ${pipelineName}`);

        process.stdout.on('data', (chunk) => {
            const line = chunk.toString();
            const include = line.match(regex);
            if (include) {
                const workflowId = include[0].substring(2, include[0].length - 2);
                log.showWorkflowLogs(workflowId, true)
                    .then(() => Promise.resolve().then(console.log(`Finished running successfully ${workflowId}`)));
            }
        });
        process.stderr.on('data', (chunk) => {
            const line = chunk.toString();
            console.error(`Error occurred while running pipeline with error : ${chalk.red(line)}`);
            this.status = 'Error';
        });
        await this.docker.run(DEFAULTS.ENGINE_IMAGE, [], [process.stdout, process.stderr], _.mergeWith({
            Env: [
                `ACCESS_TOKEN=${currentContext.token}`,
                `PIPELINE_ID=${pipelineName}`, `BRANCH=${branch}`,
                `CF_HOST=${currentContext.url}`,
                'DOCKER_SOCKET_PATH=/var/run/docker.sock',
            ],
            Hostconfig: {
                Binds: [
                    '/var/run/docker.sock:/var/run/docker.sock',
                ],
            },
            Tty: false,
        }, injectedOpts, _customizer));
        return this.error ? Promise.resolve(1) : Promise.resolve(0);

            // (err, data) => {
            //     if (err) {
            //         console.log(`An error occurred while running workflow: ${pipelineName} , Error: ${err}`);
            //     }
            //     process.exit(data.StatusCode);
            // },
        // );
    }
    // eslint-disable-next-line class-methods-use-this
    get isParalel() {
        return false;
    }
    async postRunRequest() {
        if (this.status === 'Error') {
            console.log(chalk.red('Failed to execute the pipeline'));
        } else {
            console.log(chalk.green('Pipeline executed succfully'));
        }
    }
}

module.exports = RunLocalCommand;
