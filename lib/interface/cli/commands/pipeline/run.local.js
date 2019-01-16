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

const convertStatus = (json) => {
    if (json.status === 'Pull complete') {
        return `Pulled layer '${json.id}'\n`;
    } else if (json.status.startsWith('Pulling from')) {
        return `Pulling image ${json.status.slice(13)}:${json.id}\n`;
    } else if (json.status === 'Already exists') {
        return `Layer '${json.id}' already exists\n`;
    } else if (json.id === undefined) {
        return `${json.status}\n`;
    }
    return undefined;
};

class RunLocalCommand extends RunBaseCommand {
    constructor(argv) {
        super(argv);
        this.docker = new Docker();
    }
    async preRunAll() {
        await super.preRunAll();
        console.log('Updating Codefresh engine ==>\n');
        return new Promise((resolve, reject) => {
            this.docker.pull(DEFAULTS.ENGINE_IMAGE, (err, stream) => {
                if (err) {
                    console.log(chalk.red(`Failed to update codefresh engine: \n ${err}`));
                    reject(err);
                }
                if (stream) {
                    function onFinished(error) {
                        if (error) {
                            reject(error);
                        }
                        console.log('\nFinished Update ==>\n');
                        resolve(undefined);
                    }

                    function onProgress(res) {
                        if (_.get(res, 'status')) {
                            const line = convertStatus(res);
                            if (line) {
                                process.stdout.write(line);
                            }
                        }
                    }

                    this.docker.modem.followProgress(stream, onFinished, onProgress);
                }
            });
        });
    }
    async runImpl(request) {
        const { pipelineName } = request;
        const {
            branch, userYamlDescriptor, variables, noCache, resetVolume, noCfCache, enableNotifications,
        } = request.options;
        const localVolume = this.argv['local-volume'] === true ?
            path.join(DEFAULTS.CODEFRESH_PATH, pipelineName) : this.argv['local-volume'];
        const injectedOpts = {};
        injectedOpts.Env = [];
        // TODO : Move to per command's handler so each command will be handled in a seperate handler
        if (userYamlDescriptor) {
            injectedOpts.Env.push(`OVERRIDE_WORKFLOW_YAML=${userYamlDescriptor}`);
        }
        if (localVolume) {
            injectedOpts.Env.push(`EXTERNAL_WORKSPACE=${localVolume}`);
            console.log(`\nUsing ${localVolume} as a local volume.\n`);
        }

        if (variables) {
            const envVars = Object.keys(variables).reduce((sum, key) => sum += `${key.trim()}=${variables[key]},`, '');
            injectedOpts.Env.push(`VARIABLES=${envVars.slice(0, envVars.length - 1)}`);
        }

        if (noCache) {
            injectedOpts.Env.push(`NO_CACHE=${noCache}`);
        }

        if (resetVolume) {
            injectedOpts.Env.push(`RESET_VOLUME=${resetVolume}`);
        }
        if (noCfCache) {
            injectedOpts.Env.push(`NO_CF_CACHE=${noCfCache}`);
        }
        if (enableNotifications) {
            injectedOpts.Env.push(`ENABLE_NOTIFICATIONS=${enableNotifications}`);
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
        return new Promise((resolve, reject) => {
            this.docker.run(DEFAULTS.ENGINE_IMAGE, [], undefined, _.mergeWith({
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
            }, injectedOpts, _customizer), (err, data) => {
                if (err) {
                    console.log(chalk.red(`Errored when running pipeline : ${err}`));
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject(1);
                }
            }).on('stream', (stream) => {
                stream.on('data', (chunk) => {
                    const line = chunk.toString();
                    const include = line.match(regex);
                    if (line.indexOf('error') !== -1) {
                        console.log(line);
                    }
                    if (include) {
                        const workflowId = include[0].substring(2, include[0].length - 2);
                        log.showWorkflowLogs(workflowId, true)
                            .then(() => resolve(0));
                    }
                });
            });
        });
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
