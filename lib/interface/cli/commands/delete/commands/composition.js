const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { composition }     = require('../../../../../logic').api;

const command = 'composition [name]';

const builder = (yargs) => {
    return yargs
        .positional('name', {
            describe: 'Composition name',
        });
};

const handler = async (argv) => {
    const name = (argv.filename) ? _.get(argv.filename, 'name') : argv.name;
    const currComposition = await composition.getCompositionByIdentifier(name);
    const id = currComposition ? currComposition.info.id : null;
    if (!id) {
        throw new CFError(`Cannot found composition: ${name}`);
    }
    await composition.deleteCompositionById(id);
    console.log(`Composition: ${name} deleted`);
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
