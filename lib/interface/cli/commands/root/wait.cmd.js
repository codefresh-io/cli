const _ = require('lodash');
const CFError = require('cf-errors');
const Command = require('../../Command');
const { workflow } = require('../../../../logic/api');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');


const annotate = new Command({
    root: true,
    command: 'wait <id..>',
    description: 'Wait until a condition will be met on a workflow',
    builder: (yargs) => {
        return yargs
            .option('status', {
                describe: 'Workflow status',
                alias: 's',
                choices: ['pending', 'elected', 'running', 'error', 'success', 'terminating', 'terminated'],
                required: true,
            })
            .option('debug', {
                alias: 'd',
                describe: 'Show debug output until the condition will be met',
            })
            .option('timeout', {
                alias: 't',
                describe: 'Define a timeout for the wait operation in minutes',
                default: 30,
            })
            .positional('id', {
                describe: 'Workflow id',
            });
    },
    handler: async (argv) => {
        const workflowIds = argv.id;
        const desiredStatus = argv.status;
        const descriptive = argv.d;

        _.forEach(workflowIds, (workflowId) => {
            if (!ObjectID.isValid(workflowId)) {
                throw new CFError({
                    message: `Passed workflow id: ${workflowId} is not valid`,
                });
            }
        });

        const timeoutDate = moment()
            .add(argv.timeout, 'minutes');

        return Promise.all(_.map(workflowIds, (workflowId) => {
            return workflow.waitForStatus(workflowId, desiredStatus, timeoutDate, descriptive);
        }));
    },
});

module.exports = annotate;
