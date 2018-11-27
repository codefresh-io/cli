const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const fs = require('fs');
const { spawn } = require('child_process');
const { homedir } = require('os');
const rp = require('request-promise');
const createRoot = require('../root/create.cmd');
const authManager = require('../../../../logic/auth').manager; // eslint-disable-line

const scriptUrl = 'https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/master/codefresh-k8s-configure.sh';
let filePath = `${homedir()}/.Codefresh/runtime/codefresh-k8s-configure.sh`;
const dirPath = `${homedir()}/.Codefresh/runtime`;


const callToScript = (k8sScript) =>{
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
            .positional('cluster', {
                describe: 'cluster name',
                required: true,
            })
            .option('namespace', {
                describe: 'namespace',
            })
            .option('local', {
                describe: 'set if run the script from local file system',
                type: 'boolean',
                default: false,
            })
            .option('context', {
                describe: 'set your kubectl context',
                default: '',
            })
            .example('codefresh create re [cluster] --namespace codefresh --context kubeCodefresh', 'Creating a runtime environment');
    },
    handler: async (argv) => {
        const currentContext = authManager.getCurrentContext();
        const { local, namespace, cluster, context } = argv;
        if (!local) {
            if (!fs.existsSync(dirPath)) {
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
                const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--namespace', namespace, '--context', context, cluster]);
                callToScript(k8sScript);
            });
        } else {
            filePath = './codefresh-k8s-configure.sh';
            const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--namespace', namespace, '--local','--context', context, cluster]);
            callToScript(k8sScript);
        }
    },
});


module.exports = command;
