const debug = require('debug')('codefresh:cli:replace:context');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler } = require('../../helpers/general');
const { composition } = require('../../../../logic').api;

const command = 'composition';

const describe = 'Replace a composition resource';

const builder = (yargs) => {
    return yargs;
};

const handler = async (argv) => {
    const data = argv.filename;
    const name = _.get(data, 'name');
    let id;

    if (!name) {
        throw new CFError('Missing name of the composition');
    }

    const currComposition = await composition.getCompositionByIdentifier(name);
    if (currComposition) {
        id = currComposition.info.id;
    }
    if (!id) {
        throw new CFError(`Cannot found composition: ${name}`);
    }

    await composition.replaceById(id, data);

    console.log(`Composition: ${name} replaced`);
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
