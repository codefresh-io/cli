'use strict';

const debug                  = require('debug')('codefresh:cli:create');
const CFError                = require('cf-errors');
const commands               = require('./commands');
const { crudFilenameOption } = require('../../helper');

const command = 'get';

const describe = 'Display one or many resources';

const builder = (yargs) => {
    // TODO add default command in case of no <resource>
    // TODO should we define all possible resources in this level???
    yargs
        .usage('Display one or many resources\n\n' +
               'Available Resources:\n' +
               '  * contexts\n' +
               '  * pipelines\n' +
               '  * images')
        .example('$0 get contexts', '# List all contexts')
        .example('$0 get contexts context-name', '# List a single context with specified NAME');

    crudFilenameOption(yargs);

    return yargs
        .command(commands.contexts)
        .command(commands.pipelines)
        .command(commands.images)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
