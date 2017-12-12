const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { composition } = require('../../../../../logic').api;
const { specifyOutputForSingle , specifyOutputForArray } = require('../helper');


const command = 'compositions [id]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'composition id',
        });
};

const handler = async (argv) => {
    const compositionId = argv.id;

    let compositions;
    // TODO:need to decide for one way for error handeling
    if (compositionId) {
        compositions = await composition.getCompositionById(compositionId);
        specifyOutputForSingle(argv.output, compositions);
    } else {
        compositions = await composition.getCompositions();
        specifyOutputForArray(argv.output, compositions);
    }
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
