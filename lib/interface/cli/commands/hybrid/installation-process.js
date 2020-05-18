async function create(installer, event) {
    const res = await installer.createNewInstallationProgress(event);
    return res.progress;
}

function buildReporter(installer, progress) {
    return {
        report: (event, status, options = {}) => {
            const data = {
                event,
                content: {
                    status,
                    ...options,
                },
            };
            return installer.reportInstallationProgressEvent({ id: progress.id }, data);
        },
    };
}

module.exports = {
    create,
    buildReporter,
    events: {
        RUNNER_INSTALLED: 'runner-installed',
        MONITOR_INSTALLED: 'monitor-installed',
        PIPELINE_EXECUTED: 'demo-pipeline-executed',
        PIPELINE_CREATED: 'demo-pipeline-created',
        FINISHED: 'finished',
    },
    status: {
        SUCCESS: 'success',
        FAILURE: 'failure',
    },
};
