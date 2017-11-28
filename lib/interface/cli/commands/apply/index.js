'use strict';

const debug                  = require('debug')('codefresh:cli:create');
const CFError                = require('cf-errors');
const commands               = require('./commands');
const { crudFilenameOption } = require('../../helper');

const command = 'apply';

const describe = 'TODO';

const builder = (yargs) => {
    // TODO add default command in case of no <resource>
    // TODO should we define all possible resources in this level???
    yargs
        .usage('TODO');

    crudFilenameOption(yargs);

    return yargs
        .command(commands.pipeline)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
