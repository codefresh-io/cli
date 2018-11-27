const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const rp = require('request-promise');
const createRoot = require('../root/create.cmd');
const authManager = require('../../../../logic/auth').manager; // eslint-disable-line


//const scriptUrl = 'https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/master/codefresh-k8s-configure.sh';
const scriptUrl = 'https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/auto_creation_cluster/codefresh-k8s-configure.sh';
const filePath = './codefresh-k8s-configure.sh';

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
            .example('codefresh create re [cluster]', 'Creating a runtime environment');
    },
    handler: async (argv) => {
        const currentContext = authManager.getCurrentContext();
        const { local, namespace, cluster } = argv;
        if (!local) {
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
                const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--image-tag', 'auto_creation_cluster', '--namespace', namespace, cluster]);
                callToScript(k8sScript);
            });
        } else {
            const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--image-tag', 'auto_creation_cluster', '--namespace', namespace, '--local', cluster]);
            callToScript(k8sScript);
        }
    },
});


module.exports = command;
