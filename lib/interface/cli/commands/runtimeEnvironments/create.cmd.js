const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const rp = require('request-promise');
const createRoot = require('../root/create.cmd');
const authManager = require('../../../../logic/auth').manager; // eslint-disable-line


//const scriptUrl = 'https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/master/codefresh-k8s-configure.sh';
const scriptUrl ='https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/update_script_for_support_from_cli/codefresh-k8s-configure.sh';
const filePath = './codefresh-k8s-configure.sh';


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
            .example('codefresh create re [cluster]', 'Creating a runtime environment');
    },
    handler: async (argv) => {
        const currentContext = authManager.getCurrentContext();
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
            //const execCommand = `${filePath} --api-token ${apiToken} --api-host ${apiHost} ${cluster}`;
            // const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, argv.cluster]);
            const k8sScript = spawn('bash', [filePath, '--api-token', currentContext.token, '--api-host', currentContext.url, '--image-tag', 'update_script_for_support_from_cli', argv.cluster]);
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
        });
    },
});


module.exports = command;
