const Command = require('../../Command');
const yargs = require('yargs');

const download = new Command({
    root: true,
    command: 'download',
    description: 'Download resources',
    usage: 'Codefresh download <resource>',
    webDocs: {
        title: 'Download',
        weight: 70,
    },
    handler: async () => {
        yargs.showHelp();
    },
});

module.exports = download;
