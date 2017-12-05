'use strict';

const debug                  = require('debug')('codefresh:cli:create');
const CFError                = require('cf-errors');
const commands               = require('./commands');
const { crudFilenameOption } = require('../../helper');

const command = 'replace';

const describe = 'Replace a resource by filename or stdin';

const builder = (yargs) => {
    crudFilenameOption(yargs);

    return yargs
        .command(commands.context)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
