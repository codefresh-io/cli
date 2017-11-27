'use strict';

const debug                              = require('debug')('codefresh:cli:create');
const CFError                            = require('cf-errors');
const commands                           = require('./commands');
const { crudFilenameOption }             = require('../../helper');

const command = 'create <resource>';

const describe = 'Create a resource';

const builder = (yargs) => {
    // TODO add default command in case of no <resource>
    // TODO should we define all possible resources in this level???
    yargs
        .usage('$0 create <resource>\n\n' +
               'Available Resources:\n' +
               '  * context\n' +
               '  * image\n');

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
