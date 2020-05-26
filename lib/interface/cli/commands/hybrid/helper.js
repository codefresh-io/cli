const { prettyError } = require('../../../../logic/cli-config/errors/helpers');
const colors = require('colors');
const { to } = require('./../../../../logic/cli-config/errors/awaitTo');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');

const defaultOpenIssueMessage = `If you had any issues with this process please report them at:
 ${colors.blue('https://github.com/codefresh-io/cli/issues/new')}`;

async function handleError(error, message, openIssueMessage = defaultOpenIssueMessage) {
    if (!error) {
        return;
    }

    console.log(`${colors.red('Error:')} ${message}: ${prettyError(error)}`);
    console.log(colors.green(openIssueMessage));
    process.exit(1);
}

async function getRelatedAgents(kubeNamespace, runtimes, openIssueMessage = defaultOpenIssueMessage) {
    const [listAgentsErr, agents] = await to(sdk.agents.list({}));
    await handleError(listAgentsErr, 'Failed to get agents', openIssueMessage);

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
    handleError,
};
