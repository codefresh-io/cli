'use strict';

const debug    = require('debug')('codefresh:cli:run:index');
const commands = require('./commands');

const command = 'run';

const describe = 'Run a pipeline';

const builder = (yargs) => {
    return yargs
        .command(commands.pipeline)
        .example('$0 run pipeline id -b master', '# Run pipeline by ID using master branch')
        .example('$0 run pipeline name repo-owner repo-name', '# Run pipeline by NAME, REPO-OWNER and REPO-NAME')
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
