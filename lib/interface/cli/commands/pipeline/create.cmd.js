const Command = require('../../Command');
const { sdk } = require('../../../../logic');

const createRoot = require('../root/create.cmd');

const command = new Command({
    command: 'pipelines [name]',
    aliases: ['pip', 'pipeline'],
    parent: createRoot,
    description: 'Create a pipeline',
    webDocs: {
        category: 'Pipelines',
        title: 'Create Pipeline',
    },
    builder: yargs => yargs
        .positional('name', {
            describe: 'New pipeline name',
        })
        .option('project', {
            describe: 'New pipeline project',
            default: 'default',
        })
        .option('template', {
            describe: 'template identifier to create from',
        }),
    handler: async (argv) => {
        const { template, project, name } = argv;
        const fullName = `${project}/${name}`;
        await sdk.pipelines.clone({
            id: template,
            name: fullName,
            project,
        });
        console.log(`Pipeline was ${fullName} created`);
    },
});

module.exports = command;
