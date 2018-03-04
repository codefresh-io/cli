const _ = require('lodash');
const CFError = require('cf-errors');
const Command = require('../../Command');
const { workflow } = require('../../../../logic/api');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');


const annotate = new Command({
    root: true,
    command: 'wait <id..>',
    description: 'Wait until a condition will be met on a build',
    usage: 'Wait command is useful in case there is a need to wait for a desired status on a specific set of builds',
    webDocs: {
        category: 'Builds',
        title: 'Wait For Build Condition',
        weight: 50,
    },
    builder: (yargs) => {
        return yargs
            .option('status', {
                describe: 'Build status',
                alias: 's',
                choices: ['pending', 'elected', 'running', 'error', 'success', 'terminating', 'terminated'],
                default: 'success',
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
                describe: 'Build id',
            })
            .example('codefresh wait ID', 'Wait until build "ID" will reach "success" status')
            .example('codefresh wait ID --status=terminated', 'Wait until build "ID" will reach "terminated" status')
            .example('codefresh wait ID1 ID2', 'Wait until build "ID1" and build "ID2" will reach "success" status');
    },
    handler: async (argv) => {
        const workflowIds = argv.id;
        const desiredStatus = argv.status;
        const descriptive = argv.d;

        _.forEach(workflowIds, (workflowId) => {
            if (!ObjectID.isValid(workflowId)) {
                throw new CFError({
                    message: `Passed build id: ${workflowId} is not valid`,
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
