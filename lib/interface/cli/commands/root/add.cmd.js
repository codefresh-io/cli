const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const { context, pipeline } = require('../../../../logic').api;
const yargs = require('yargs');
const { validatePipelineFile } = require('../../helpers/validation');

const add = new Command({
    root: true,
    command: 'add',
    description: 'Add a resource',
    // usage: 'Supported resources: \n\t\'context\'\n\t\'pipeline\'',
    webDocs: {
        description: 'Add a resource',
        category: 'Operate On Resources',
        title: 'Add',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = add;
