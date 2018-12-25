const debug = require('debug')('codefresh:cli:create:context');
const _ = require('lodash');
const Command = require('../../Command');
const fs = require('fs');
const { spawn } = require('child_process');
const rp = require('request-promise');
const createRoot = require('../root/create.cmd');
const authManager = require('../../../../logic/auth').manager; // eslint-disable-line
const { cluster } = require('../../../../logic').api;
const CFError = require('cf-errors');

const { CODEFRESH_PATH } = require('../../defaults');
const scriptUrl = 'https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/master/codefresh-k8s-configure.sh';
let filePath = `${CODEFRESH_PATH}/runtime/codefresh-k8s-configure.sh`;
const dirPath = `${CODEFRESH_PATH}/runtime`;
const { createHybridRuntimeWithAgent } = require('./../../../../logic/api/runtimeEnvironments');


const callToScript = (k8sScript) => {
    k8sScript.stdout.pipe(process.stdout);
    k8sScript.stderr.pipe(process.stderr);
    process.stdin.pipe(k8sScript.stdin);
    k8sScript.on('exit', (code) => {
        fs.unlink('filePath', (error) => {
            if (error) {
                throw error;
            }
            console.log('finish');
        });
        process.exit(code);
    });
};


const command = new Command({
    command: 'runtime-environments [cluster]',
    aliases: ['re', 'runtime-environment'],
    parent: createRoot,
    description: 'Create a runtime environment',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Create Runtime-Environments',
        weight: 100,
    },
    builder: (yargs) => {
        return yargs
            .option('agent', {
                describe: 'Setup runtime environment with Codefresh agent (ignore cluster)',
                default: false,
                type: Boolean,
            })
            .option('cluster', {
                describe: 'codefresh cluster integration name',
                alias: 'c',
            })
            .option('namespace', {
                describe: 'namespace',
                alias: 'n',
                default: 'codefresh',
            })
            .option('kube-context', {
                describe: 'kubectl context name',
                alias: 'kc',
            })
            .option('gcloud', {
                describe: 'set if your cluster provider is gcloud',
                type: Boolean,
            })
            .example('codefresh create re --cluster prod --namespace codefresh --kube-context kubeCodefresh', 'Creating a runtime environment which configured to cluster prod and namespace codefresh');
    },
    handler: async (argv) => {
        const currentContext = authManager.getCurrentContext();
        const { namespace } = argv;
        const clusterName = argv.cluster;
        const context = argv['kube-context'] || '';
        const gcloud = argv.gcloud || '';
        const withAgent = argv.agent;
        if (!withAgent) {
            const clusters = await cluster.getAllClusters();
            const validCluster = _.find(clusters, c => _.isEqual(c.info.name, clusterName));
            if (validCluster) {
                if (!process.env.LOCAL) {
                    if (!fs.existsSync(CODEFRESH_PATH)) {
                        fs.mkdirSync(CODEFRESH_PATH);
                        fs.mkdirSync(dirPath);
                    } else if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath);
                    }
                    const options = {
                        url: scriptUrl,
                        method: 'GET',
                    };
                    const response = await rp(options);
                    fs.writeFile(filePath, response, (err) => {
                        if (err) {
                            throw err;
                        }
                        fs.chmodSync(filePath, '644');
                        const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--namespace', namespace, '--image-tag', 'master', '--remote', '--context', context, '--gcloud', gcloud, clusterName]);
                        callToScript(k8sScript);
                    });
                } else {
                    filePath = './codefresh-k8s-configure.sh';
                    const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--namespace', namespace,'--context', context, '--image-tag', 'master','--gcloud', gcloud, clusterName]);
                    callToScript(k8sScript);
                }
            } else {
                throw new CFError(`No cluster exists with the name: ${clusterName}`);
            }
        } else {
            return createHybridRuntimeWithAgent({
                clusterName: context,
                namespace,
            });
        }
    },
});


module.exports = command;
