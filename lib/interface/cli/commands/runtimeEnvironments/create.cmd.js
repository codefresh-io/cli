const debug = require('debug')('codefresh:cli:create:context');
const _ = require('lodash');
const Command = require('../../Command');
const fs = require('fs');
const { spawn } = require('child_process');
const { homedir } = require('os');
const rp = require('request-promise');
const createRoot = require('../root/create.cmd');
const authManager = require('../../../../logic/auth').manager; // eslint-disable-line
const { cluster } = require('../../../../logic').api;
const CFError = require('cf-errors');

const scriptUrl = 'https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/master/codefresh-k8s-configure.sh';
let filePath = `${homedir()}/.Codefresh/runtime/codefresh-k8s-configure.sh`;
const dirPath = `${homedir()}/.Codefresh/runtime`;
const codefreshPath = `${homedir()}/.Codefresh`;


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
        category: 'Runtime-Environments (On Prem)',
        title: 'Create Runtime-Environments',
        weight: 100,
    },
    builder: (yargs) => {
        return yargs
            .option('kubernetes-cluster', {
                describe: 'kubernetes cluster name',
                alias: 'kc',
                required: true,
            })
            .option('namespace', {
                describe: 'namespace',
                alias: 'n',
                default: 'codefresh',
            })
            .option('context', {
                describe: 'set the desire kubernetes context',
            })
            .example('codefresh create re --kubernetes-cluster prod --namespace codefresh --context kubeCodefresh', 'Creating a runtime environment which configured to cluster prod and namespace codefresh');
    },
    handler: async (argv) => {
        const currentContext = authManager.getCurrentContext();
        const { namespace } = argv;
        const clusterName = argv['kubernetes-cluster'];
        let { context } = argv;
        if (!context) {
            context = '';
        }
        const clusters = await cluster.getAllClusters();
        const validCluster = _.find(clusters, (c) => {
            return _.isEqual(c.info.name, clusterName);
        });
        if (validCluster) {
            if (!process.env.LOCAL) {
                if (!fs.existsSync(codefreshPath)) {
                    fs.mkdirSync(codefreshPath);
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
                    const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--namespace', namespace, '--image-tag', 'master', '--remote', '--context', context, clusterName]);
                    callToScript(k8sScript);
                });
            } else {
                filePath = './codefresh-k8s-configure.sh';
                const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--namespace', namespace,'--context', context, '--image-tag', 'master', clusterName]);
                callToScript(k8sScript);
            }
        } else {
            throw new CFError(`No cluster exists with the name: ${clusterName}`);
        }
    },
});


module.exports = command;
