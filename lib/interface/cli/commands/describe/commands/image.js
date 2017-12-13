const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { image }       = require('../../../../../logic').api;
const yaml            = require('js-yaml');

const command = 'image <id>';

const describe = 'describe image';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'image id',
        });
};

const handler = async (argv) => {
    const id = argv.filename ? _.get(argv.filename, 'id') : argv.id;
    const currImage = await image.getImageById(id);
    console.log(currImage.describe());
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
