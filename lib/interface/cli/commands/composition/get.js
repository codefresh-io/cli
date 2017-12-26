const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler } = require('../../helpers/general');
const { composition } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');


const command = new Command({
    command: 'compositions [id|name]',
    description: 'Get compositions',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'composition id or name',
            });
    },
    handler: async (argv) => {
        const compositionId = argv.id;

        let compositions;
        // TODO:need to decide for one way for error handeling
        if (compositionId) {
            compositions = await composition.getCompositionByIdentifier(compositionId);
            specifyOutputForSingle(argv.output, compositions);
        } else {
            compositions = await composition.getCompositions();
            specifyOutputForArray(argv.output, compositions);
        }
    },
});

module.exports = command;

