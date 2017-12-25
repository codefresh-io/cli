const debug                                             = require('debug')('codefresh:cli:create:context');
const CFError                                           = require('cf-errors');
const _                                                 = require('lodash');
const DEFAULTS                                          = require('../../../defaults');
const { wrapHandler }                                   = require('../../../helper');
const { workflow }                                      = require('../../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../helper');


const command = 'workflows [id]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'workflow id',
        })
        .option('limit', {
            describe: 'Limit amount of returned results',
            default: DEFAULTS.GET_LIMIT_RESULTS,
        })
        .option('page', {
            describe: 'Paginated page',
            default: DEFAULTS.GET_PAGINATED_PAGE,
        });
};

const handler = async (argv) => {
    const workflowId = argv.id;
    const limit      = argv.limit;
    const page       = argv.page;
    const output     = argv.output ? argv.output : 'default';

    let workflows;
    // TODO:need to decide for one way for error handeling
    if (workflowId) {
        workflows = await workflow.getWorkflowById(workflowId);
        specifyOutputForSingle(output, workflows);
    } else {
        workflows = await workflow.getWorkflows({
            limit,
            page,
        });
        specifyOutputForArray(output, workflows);
    }
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
