const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { composition }       = require('../../../../../logic').api;

const command = 'composition <id>';

const describe = 'describe composition';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'composition id',
        });
};

const handler = async (argv) => {
    const id = argv.id;

    const currComposition = await composition.getCompositionById(id);
    console.log(currComposition.describe());
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
