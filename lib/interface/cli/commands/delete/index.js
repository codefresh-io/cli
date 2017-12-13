'use strict';

const debug                  = require('debug')('codefresh:cli:delete');
const CFError                = require('cf-errors');
const commands               = require('./commands');
const { crudFilenameOption } = require('../../helper');

const command = 'delete';

const describe = 'Delete a resource by file or resource name';

const builder = (yargs) => {
    // TODO add default command in case of no <resource>
    // TODO should we define all possible resources in this level???
    yargs
        .usage('Delete a resource by file or resource name\n\n' +
               'Available Resources:\n' +
               '  * context\n' +
               '  * image')
        .example('$0 delete -f ./filename', '# Delete a resource from FILE')
        .example('$0 delete context -f ./filename', '# Delete a context from FILE')
        .example('$0 delete context name', '# Delete a context by NAME');

    crudFilenameOption(yargs);

    return yargs
        .command(commands.context)
        .command(commands.composition)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
