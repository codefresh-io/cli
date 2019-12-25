const _ = require('lodash');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const { createEntity, entityList } = require('../../helpers/entitiesManifests');
const yargs = require('yargs');

function _getSupportedResourcesStr() {
    return entityList
        .map(entity => `\n\t'${entity}'`)
        .join('');
}
const get = new Command({
    root: true,
    command: 'create',
    description: 'Create a resource from a file or stdin',
    usage: `Supported resources: ${_getSupportedResourcesStr()}`,
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

        await createEntity({ name, data, entity });
        console.log(_.compact([_.capitalize(entity), name, 'created']).join(' '));
    },
});

module.exports = get;
