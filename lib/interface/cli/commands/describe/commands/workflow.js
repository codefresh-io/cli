const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { workflow }       = require('../../../../../logic').api;

const command = 'workflow <id>';

const describe = 'describe workflow';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'workflow id',
        });
};

const handler = async (argv) => {
    const id = argv.filename ? _.get(argv.filename, 'id') : argv.id;
    const currWorkflow = await workflow.getWorkflowById(id);
    console.log(currWorkflow.describe());
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
