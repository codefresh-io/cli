'use strict';

const debug                              = require('debug')('codefresh:cli:create');
const CFError                            = require('cf-errors');
const commands                           = require('./commands');
const { crudFilenameOption }             = require('../../helper');

const command = 'describe <resource>';

const describe = 'describe';

const builder = (yargs) => {
    // TODO add default command in case of no <resource>
    // TODO should we define all possible resources in this level???
    yargs
        .usage('$0 describe <resource>\n\n' +
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
