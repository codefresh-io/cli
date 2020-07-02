const _ = require('lodash');
const Promise = require('bluebird');
const Command = require('../../../Command');
const createRoot = require('../../root/create.cmd');
const { sdk } = require('../../../../../logic');
const { crudFilenameOption } = require('../../../helpers/general');

function builder(y) {
    crudFilenameOption(y);
    return y
        .option('workflow', {
            describe: 'Workflow ID that the Workflow-Data-Item belongs to',
            required: true,
        })
        .example('codefresh create workflow-data-item --workflow [WORKFLOW_ID] --file ./file.json', 'Create new Workflow-Data-Iten that belongs to WORKFLOW_ID with content from "./file.json"')
}

async function handler({ workflow, filename }) {
    let payload;
    if (filename) { // file content
        payload = filename;
    }
    const res = await sdk.workflows.pushWorkflowData({
        payload,
        workflowId: workflow,
    });
    console.log(`Workflow-Data-Item ${_.get(res, '_id')} created`);
    return Promise.resolve();
}

const command = new Command({
    command: 'workflow-data-item',
    aliases: ['wdi'],
    parent: createRoot,
    description: 'Create New Workflow Data Item',
    webDocs: {
        category: 'Workflow-Data',
        title: 'Create',
    },
    builder,
    handler,
});

module.exports = command;
