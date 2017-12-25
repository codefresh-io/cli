const debug                                             = require('debug')('codefresh:cli:create:context');
const CFError                                           = require('cf-errors');
const _                                                 = require('lodash');
const { wrapHandler }                                   = require('../../../helper');
const { composition }                                   = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../helper');


const command = 'compositions [id|name]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'composition id or name',
        });
};

const handler = async (argv) => {
    console.log(argv.filename);
    const compositionId = argv.id;
    const output = argv.output ? argv.output : 'default';
    let compositions;
    // TODO:need to decide for one way for error handeling
    if (compositionId) {
        compositions = await composition.getCompositionByIdentifier(compositionId);
        specifyOutputForSingle(output, compositions);
    } else {
        compositions = await composition.getCompositions();
        specifyOutputForArray(output, compositions);
    }

};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
