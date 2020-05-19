const Promise = require('bluebird');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');

async function create(installer, event) {
    const [err, res] = await to(installer.createNewInstallationProgress(event));
    if (err) {
        return {};
    }
    return res.progress;
}

function buildReporter(installer, progress) {
    return {
        report: async (event, status, options = {}) => {
            if (!progress.id) {
                return Promise.resolve();
            }
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
