'use strict';

const debug    = require('debug')('codefresh:cli:run:index');
const commands = require('./commands');

const command = 'annotate';

const describe = 'Annotate a resource with labels';

const builder = (yargs) => {
    return yargs
        .usage('Annotate a resource with labels\n\n' +
               'Available Resources:\n' +
               '  * image')
        .command(commands.image)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
