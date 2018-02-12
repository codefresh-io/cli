require('debug')('codefresh:functional:functions:workflow');
const _ = require('lodash');
const CFError = require('cf-errors');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const { workflow, pipeline, log } = require('../../../logic/index').api;

const DEFAULTS = require('../defaults');

//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const STATUS_CHOICES = [
    'error', 'running', 'success', 'terminating', 'terminated', 'pending', 'elected',
];

const TRIGGER_CHOICES = [
    'build', 'launch', 'webhook',
];

const getWorkflow = async (workflowId) => {
    if (!workflowId) {
        throw new CFError('workflowId must be provided');
    }

    return workflow.getWorkflowById(workflowId);
};

const getAllWorkflows = async (
    limit = DEFAULTS.GET_LIMIT_RESULTS,
    page = DEFAULTS.GET_PAGINATED_PAGE,
    filterByStatus = STATUS_CHOICES,
    filterByTrigger = TRIGGER_CHOICES,
    filterByPipelineNames = [],
    filterByPipelineIds = [],
) => {
    if (!_.isEmpty(filterByPipelineNames)) {
        const pipelines = await pipeline.getAll({
            name: filterByPipelineNames,
        });
        if (!_.isEmpty(pipelines)) {
            const MatchPipelines = _.isArray(pipelines) ? pipelines : [pipelines];
            _.forEach(MatchPipelines, (currPipeline) => {
                filterByPipelineIds.push(currPipeline.info.id);
            });
        } else if (_.isEmpty(filterByPipelineIds)) {
            // Cannot find any workflows with these pipelines names
            return [];
        }
    }
    return workflow.getWorkflows({
        limit,
        page,
        status: filterByStatus,
        trigger: filterByTrigger,
        pipelineIds: filterByPipelineIds,
    });
};

const showWorkflowLogs = async (workflowId, followLogs) => {
    await log.showWorkflowLogs(workflowId, followLogs);
    return true;
};

const restartWorkflow = async (workflowId) => {
    const executionResults = {};
    const newWorkflowId = await workflow.restartWorkflowById(workflowId);
    console.log(`Workflow: ${workflowId} restarted, new workflow is ${newWorkflowId}`);

    const workflowInstance = await workflow.getWorkflowById(newWorkflowId);
    executionResults[workflowId] = workflowInstance.getStatus();

    return executionResults;
};

const terminateWorkflow = async (workflowId) => {
    await workflow.terminateWorkflowById(workflowId);
    console.log(`Workflow: ${workflowId} terminated`);
    return true;
};

const waitForWorkflows = async (
    workflowIds,
    desiredStatus,
    timeoutPerWorkflow = 30,
    debugOutput = false,
) => {
    _.forEach(workflowIds, (workflowId) => {
        if (!ObjectID.isValid(workflowId)) {
            throw new CFError({
                message: `Workflow ID ${workflowId} is not valid`,
            });
        }
    });

    const timeoutDate = moment().add(timeoutPerWorkflow, 'minutes');

    return Promise.all(_.map(
        workflowIds,
        workflowId => workflow.waitForStatus(
            workflowId,
            desiredStatus,
            timeoutDate,
            debugOutput,
        ),
    ));
};

module.exports = {
    getWorkflow,
    getAllWorkflows,
    showWorkflowLogs,
    restartWorkflow,
    terminateWorkflow,
    waitForWorkflows,
};
