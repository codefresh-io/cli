const { prettyError } = require('../../../../logic/cli-config/errors/helpers');
const colors = require('colors');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const installationProgress = require('./installation-process');

const defaultOpenIssueMessage = `If you had any issues with this process please report them at:
 ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;

async function createErrorHandler(openIssueMessage = defaultOpenIssueMessage) {
    return async (error, message, progressReporter, event) => {
        if (!error) {
            return;
        }

        if (progressReporter) {
            await to(progressReporter.report(event, installationProgress.status.FAILURE));
        }

        console.log(`${colors.red('Error:')} ${message}: ${prettyError(error)}`);
        console.log(colors.green(openIssueMessage));
        process.exit(1);
    };
}

async function getRelatedAgents(kubeNamespace, runtimes, errHandler) {
    const [listAgentsErr, agents] = await to(sdk.agents.list({}));
    await errHandler(listAgentsErr, 'Failed to get agents');

    const relatedREs = new Set();
    _.forEach(runtimes, (r) => {
        if (_.get(r, 'runtimeScheduler.cluster.namespace') === kubeNamespace) {
            relatedREs.add(r.metadata.name);
        }
    });

    const relatedAgents = [];
    _.forEach(agents, (a) => {
        _.forEach(_.get(a, 'runtimes', []), (r) => {
            if (relatedREs.has(r)) {
                relatedAgents.push(a);
            }
        });
    });

    return relatedAgents;
}

module.exports = {
    getRelatedAgents,
    createErrorHandler,
};
