const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { workflow } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');

const command = new Command({
    command: 'workflows [id]',
    description: 'Get workflows',
    builder: (yargs) => {
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
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        const limit = argv.limit;
        const page = argv.page;

        let workflows;
        // TODO:need to decide for one way for error handeling
        if (workflowId) {
            workflows = await workflow.getWorkflowById(workflowId);
            specifyOutputForSingle(argv.output, workflows);
        } else {
            workflows = await workflow.getWorkflows({
                limit,
                page,
            });
            specifyOutputForArray(argv.output, workflows);
        }
    },
});

module.exports = command;
