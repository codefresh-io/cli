const _ = require('lodash');
const Promise = require('bluebird');
const Command = require('../../../Command');
const getRoot = require('../../root/get.cmd');
const { sdk } = require('../../../../../logic');
const Output = require('../../../../../output/Output');
const WorkflowDataItem = require('../../../../../logic/entities/WorkflowDataItem');

async function _get(workflowId, workflowDataItemIds, decrypt) {
    const result = [];
    await Promise.map((workflowDataItemIds), async (id) => {
        const res = await sdk.workflows.getWorkflowDataItem({
            workflowId,
            id,
            decrypt,
        });
        result.push(WorkflowDataItem.fromResponse(res));
        return Promise.resolve();
    });
    return result;
}

async function _list(workflowId) {
    const res = await sdk.workflows.getWorkflowData({
        workflowId,
    });
    return _.map(res.docs, WorkflowDataItem.fromResponse);
}

function builder(y) {
    return y
        .positional('id', {
            describe: 'Workflow-Data-Item ID',
        })
        .option('workflow', {
            describe: 'Workflow ID that the Workflow-Data-Item belongs to',
            required: true,
            alias: 'wf',
        })
        .option('decrypt', {
            describe: 'When requesting spesific Workflow-Data-Item, decrypt the stored data',
            typoe: 'boolean',
        })
        .example('codefresh get workflow-data-item --workflow [WORKFLOW_ID]', 'Get all Workflow-Data-Items for given WORKFLOW_ID')
        .example('codefresh get workflow-data-item [WORKFLOW_DATA_ITEM_ID] --decrypt --workflow [WORKFLOW_ID]', 'Get and decrypt WORKFLOW_DATA_ITEM_ID that is was reported to WORKFLOW_ID');
}

async function handler({ workflow, id, decrypt }) {
    let res;
    if (id && id.length > 0) {
        res = await _get(workflow, id, decrypt);
    } else {
        res = await _list(workflow);
    }
    Output.print(res);
}

const command = new Command({
    command: 'workflow-data-item [id..]',
    aliases: ['wdi'],
    parent: getRoot,
    description: 'Get Workflow Data Item',
    usage: 'Passing [id] argument will cause a retrieval of a specific Workflow-Data-Item.',
    webDocs: {
        category: 'Workflow-Data',
        title: 'Get',
    },
    builder,
    handler,
});

module.exports = command;
