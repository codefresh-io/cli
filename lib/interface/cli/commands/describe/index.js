'use strict';

const debug                  = require('debug')('codefresh:cli:create');
const CFError                = require('cf-errors');
const commands               = require('./commands');
const { crudFilenameOption } = require('../../helper');

const command = 'describe';

const describe = 'Show details of a specific resource or group of resources';

const builder = (yargs) => {
    // TODO add default command in case of no <resource>
    // TODO should we define all possible resources in this level???
    yargs
        .usage('Show details of a specific resource or group of resources\n\n' +
               'Available Resources:\n' +
               '  * context\n' +
               '  * image')
        .example('$0 describe -f ./filename', '# Describe a resource from FILE')
        .example('$0 describe context -f ./filename', '# Describe a context from FILE')
        .example('$0 describe context name', '# Describe a config context by NAME');

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
