const Command = require('../../Command');
const componentsRoot = require('../root/components.cmd');
const helper = require('../hybrid/helper');

const command = new Command({
    command: 'download',
    parent: componentsRoot,
    description: 'Download Codefresh CLI components',
    webDocs: {
        category: 'Components',
        title: 'Download',
    },
    builder: (yargs) => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('location', {
            describe: 'Override download folder location. Default: ~/.Codefresh',
        })
        .option('components', {
            describe: 'Components. List of [stevedore, venona, argocd-agent, codefresh]',
        }),
    handler: async (argv) => {
        console.log('Downloading components');
        const { location, components } = argv;
        await helper.downloadComponents(location, components);
    },
});

module.exports = command;
