const debug = require('debug')('codefresh:cli:create:context');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler } = require('../../helpers/general');
const { composition } = require('../../../../logic').api;

const command = 'composition <id|name>';

const describe = 'describe composition';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'composition id or name',
        });
};

const handler = async (argv) => {
    const id = argv.filename ? _.get(argv.filename, 'name') : argv.id;

    const currComposition = await composition.getCompositionByIdentifier(id);
    console.log(currComposition.describe());
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
