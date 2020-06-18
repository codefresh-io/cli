const _ = require('lodash');
const Command = require('../../Command');
const Logic = require('./analyzer.logic');

const command = new Command({
    root: true,
    command: 'analyze <repoOwner> <repoName> [context]',
    description: 'Analyzes your git repository and creates a proposed Codefresh pipeline that clones the source code and builds/packages it',
    webDocs: {
        category: 'Analyzer',
        title: 'Analyze'
    },
    builder: yargs => yargs
        .positional('repoOwner', {
            describe: 'Repository owner',
            required: true,
        })
        .positional('repoName', {
            describe: 'Repository name',
            required: true,
        })
        .positional('context', {
            describe: 'Your git context that you can get from integrations -> git , if empty - using personal context',
            required: false
        })
        .example('codefresh analyze elasticio petstore-component-nodejs github', 'Analyze repo'),
    handler: async (argv) => {
        const { repoOwner, repoName, context } = argv;
        const yaml = await Logic.analyze({repoOwner, repoName, context});
        console.log(yaml);
    },
});

module.exports = command;
