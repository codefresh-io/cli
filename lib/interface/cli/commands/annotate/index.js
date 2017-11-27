'use strict';

const debug    = require('debug')('codefresh:cli:run:index');
const commands = require('./commands');

const command = 'annotate';

const describe = 'annotate';

const builder = (yargs) => {
    return yargs
        .command(commands.image)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
