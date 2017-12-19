'use strict';

const debug                  = require('debug')('codefresh:cli:create');
const CFError                = require('cf-errors');
const commands               = require('./commands');
const { crudFilenameOption } = require('../../helper');

const command = 'apply';

const describe = 'Apply a configuration to a resource by filename or stdin';

const builder = (yargs) => {
    crudFilenameOption(yargs);

    return yargs
        .command(commands.pipeline)
        .command(commands.context)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
