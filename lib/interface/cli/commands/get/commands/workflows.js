const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { workflow } = require('../../../../../logic').api;
const { specifyOutputForSingle , specifyOutputForArray } = require('../helper');


const command = 'workflows [id]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'workflow id',
        });
};

const handler = async (argv) => {
    const workflowId = argv.id;

    let workflows;
    // TODO:need to decide for one way for error handeling
    if (workflowId) {
        workflows = await workflow.getWorkflowById(workflowId);
        specifyOutputForSingle(argv.output, workflows);
    } else {
        workflows = await workflow.getWorkflows();
        specifyOutputForArray(argv.output, workflows);
    }
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
