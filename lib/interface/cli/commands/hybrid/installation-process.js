const events = {
    RUNNER_INSTALLED: 'runner-installed',
    MONITOR_INSTALLED: 'monitor-installed',
    PIPELINE_EXECUTED: 'demo-pipeline-executed',
    PIPELINE_CREATED: 'demo-pipeline-created',
    FINISHED: 'finished',
};

async function create(installer, event) {
    const res = await installer.createNewInstallationProgress(event);
    return res.progress;
}

async function report(installer, id, data) {
    return installer.reportInstallationProgressEvent({ id }, { event: data.event, content: data.content });
}

module.exports = {
    create,
    report,
    events,
};
