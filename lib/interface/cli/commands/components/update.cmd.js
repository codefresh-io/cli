const Command = require('../../Command');
const componentsRoot = require('../root/components.cmd');
const helper = require('../hybrid/helper');

const command = new Command({
    command: 'update',
    parent: componentsRoot,
    description: 'Update Codefresh CLI components',
    webDocs: {
        category: 'Components',
        title: 'Update',
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('location', {
            describe: 'Override download folder location',
        }),
    handler: async (argv) => {
        console.log('Updating components');
        const { location } = argv;
        await helper.downloadRelatedComponents(location);
    },
});

module.exports = command;
