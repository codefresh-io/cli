const _ = require('lodash');
const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const creatingEntities = require('../../helpers/creatingEntities');
const yargs = require('yargs');

const get = new Command({
    root: true,
    command: 'create',
    description: 'Create a resource from a file or stdin',
    usage: 'Supported resources: \n\t\'context\'\n\t\'pipeline\'\'\n\t\'step-type\'',
    webDocs: {
        description: 'Create a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Create',
        weight: 20,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs;
    },
    handler: async (argv) => {
        if (!argv.filename) {
            yargs.showHelp();
            return;
        }

        const data = argv.filename;
        const entity = data.kind;

        const name = data.metadata.name;
        if (!name) {
            throw new CFError('Name is missing');
        }

        const entities = creatingEntities({ name, data });

        if (!entities[entity]) {
            throw new CFError(`Entity: ${entity} not supported`);
        }

        await entities[entity]();
        console.log(`${_.capitalize(entity)}: ${name} created`);
    },
});

module.exports = get;
