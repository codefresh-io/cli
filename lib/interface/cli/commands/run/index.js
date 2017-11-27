'use strict';

const debug    = require('debug')('codefresh:cli:run:index');
const commands = require('./commands');

const command = 'run';

const describe = 'run';

const builder = (yargs) => {
    return yargs
        .command(commands.pipeline)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
