const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const deleteRoot = require('../root/delete.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'composition <name>',
    aliases: ['com'],
    parent: deleteRoot,
    description: 'Delete a composition',
    webDocs: {
        category: 'Compositions',
        title: 'Delete Composition',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs
            .positional('name', {
                describe: 'Composition name',
            })
            .example('codefresh delete composition NAME', 'Delete a composition');
    },
    handler: async (argv) => {
        const name = (argv.filename) ? _.get(argv.filename, 'name') : argv.name;
        const currComposition = await sdk.compositions.get({ id: name });
        const id = currComposition ? currComposition._id : null;
        if (!id) {
            throw new CFError(`Cannot found composition: '${name}'`);
        }
        await sdk.compositions.delete({ id });
        console.log(`Composition: '${name}' deleted`);
    },
});


module.exports = command;

