const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const replaceRoot = require('../root/replace.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');
const { prepareKeyValueCompostionFromCLIEnvOption } = require('../../helpers/general');


const command = new Command({
    command: 'composition [name]',
    aliases: ['com'],
    parent: replaceRoot,
    description: 'Replace a composition resource',
    webDocs: {
        category: 'Compositions',
        title: 'Replace Composition',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        crudFilenameOption(yargs, {
            name: 'compose-file',
            describe: 'Path to docker-compose.yaml file to use to create the resource',
            alias: 'c',
            required: true,
            raw: true,
        });
        return yargs
            .positional('name', {
                describe: 'Name of composition',
            })
            .option('variable', {
                describe: 'Variables list',
                default: [],
                alias: 'v',
            })
            .option('advanced', {
                describe: 'Advanced composition',
                default: false,
                type: 'boolean',
                alias: 'a',
            })
            .example('codefresh replace composition -f ./composition-spec.yml', 'Replace a composition using a spec file')
            .example('codefresh replace composition NAME --compose-file ./docker-compose.yml -v key1=value1 -v key2=value2', 'Replace a composition using options');
    },
    handler: async (argv) => {
        const data = argv.filename || {
            name: argv.name,
            vars: prepareKeyValueCompostionFromCLIEnvOption(argv.variable),
            yamlJson: argv['compose-file'],
            isAdvanced: argv.advanced,
        };
        const name = _.get(data, 'name');
        let id;

        if (!name) {
            throw new CFError('Missing name of the composition');
        }

        const currComposition = await sdk.compositions.get({ id: name });
        if (currComposition) {
            id = currComposition._id;
        }
        if (!id) {
            throw new CFError(`Cannot find composition: ${name}`);
        }

        await sdk.compositions.update({ id }, data);

        console.log(`Composition: ${name} replaced`);
    },
});


module.exports = command;

