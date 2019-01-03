const Docker = require('dockerode');
const RunBaseCommand = require('./run.base');
const path = require('path');
const DEFAULTS = require('../../defaults');
const authManager = require('../../../../logic').auth.manager;
const _ = require('lodash');
const { log } = require('../../../../logic').api;

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
        const { branch, userYamlDescriptor } = request.options;
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

        const currentContext = authManager.getCurrentContext();
        console.log(`Running pipeline: ${pipelineName}`);

        process.stdout.on('data', (chunk) => {
            const line = chunk.toString();
            const include = line.match(regex);
            if (include) {
                const workflowId = include[0].substring(2, include[0].length - 2);
                log.showWorkflowLogs(workflowId, true)
                    .then(() => Promise.resolve());
            }
        });
        process.stderr.on('data', (chunk) => {
            const line = chunk.toString();
            const include = line.match(regex);
            if (include) {
                const workflowId = include[0].substring(2, include[0].length - 2);
                log.showWorkflowLogs(workflowId, true)
                    .then(() => Promise.resolve());
            }
        });
        const result = await this.docker.run(DEFAULTS.ENGINE_IMAGE, [], [process.stdout, process.stderr], { Tty: false }, _.mergeWith({
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
        }, injectedOpts, _customizer));
        console.log(result.output.StatusCode);

        // , (err, data) => {
        //     process.exit(data.StatusCode);
        // }).on('stream', (stream) => {
        //     stream.on('data', (chunk) => {
        //         const line = chunk.toString();
        //         const include = line.match(regex);
        //         if (include) {
        //             const workflowId = include[0].substring(2, include[0].length - 2);
        //             log.showWorkflowLogs(workflowId, true)
        //                 .then(() => Promise.resolve());
        //         }
        //     });
        // });
    }
    // eslint-disable-next-line class-methods-use-this
    get isParalel() {
        return false;
    }
}

module.exports = RunLocalCommand;
