const debug = require('debug')('codefresh:cli:create:context:helmRepo:http');
const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const createHelmRepoCmd = require('./../base.cmd');
const { context } = require('../../../../../../../logic/index').api;


const command = new Command({
    command: 'http <name>',
    parent: createHelmRepoCmd,
    description: 'Create a helm-repository context from HTTP server',
    usage: `
    A chart repository is an HTTP server that houses an index.yaml file and optionally some packaged charts.
    When you're ready to share your charts, the preferred way to do so is by uploading them to a chart repository.
    Read more: https://github.com/kubernetes/helm/blob/master/docs/chart_repository.md`,
    webDocs: {
        category: 'Create Helm-Repository Context',
        subCategory: 'HTTP',
        title: 'From HTTP web server',
    },
    builder: (yargs) => {
        yargs
            .option('url', {
                describe: 'Url to the web server',
                required: true,
            });
        return yargs;
    },
    handler: async (argv) => {
        const data = {
            apiVersion: 'v1',
            kind: 'context',
            owner: argv.owner,
            metadata: {
                name: argv.name,
            },
            spec: {
                type: 'helm-repository',
                data: {
                    repositoryUrl: argv.url,
                },
            },
        };
        
        let { url } = argv;
        const indexFileName = 'index.yaml';
        if (url.endsWith(indexFileName)) {
            url = url.substring(0, url.indexOf(indexFileName));
        }

        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }
        
        await context.createContext(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;

