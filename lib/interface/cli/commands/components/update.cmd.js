const Command = require('../../Command');
const componentsRoot = require('../root/components.cmd');
const helper = require('../hybrid/helper');

const command = new Command({
    command: 'update',
    parent: componentsRoot,
    description: 'Update Codefresh CLI components',
    webDocs: {
        category: 'Componenets',
        title: 'Update',
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('path', {
            describe: 'Path to place components',
        }),
    handler: async (argv) => {
        const downloadPath = argv.path || process.cwd();
        console.log(`Updating components to ${downloadPath}`);
        await helper.downloadRelatedComponents(downloadPath);
    },
});

module.exports = command;
