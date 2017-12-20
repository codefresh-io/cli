'use strict';

const debug                  = require('debug')('codefresh:cli:create');
const CFError                = require('cf-errors');
const commands               = require('./commands');
const { wrapHandler, crudFilenameOption } = require('../../helper');

const command = 'create';

const describe = 'Create a resource from a file or from stdin';

const builder = (yargs) => {
    // TODO add default command in case of no <resource>
    // TODO should we define all possible resources in this level???
    yargs
        .example('$0 create -f ./filename', '# Create a resource from FILE')
        .example('$0 create context -f ./filename', '# Create a context from FILE')
        .example('$0 create context config name -v key1=value2', '# Create a config context by NAME with a variable');

    crudFilenameOption(yargs);

    return yargs
        .command(commands.context)
        .command(commands.composition)
        .demandCommand(1, 'You need at least one command before moving on');
};

const handler = async (argv) => {
    throw new CFError('Not implemented');
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
