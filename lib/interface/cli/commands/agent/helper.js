const sdk = require('../../../../logic/sdk');
const _ = require('lodash');

async function getNewAgentName(kubeContextName, kubeNamespace, agents) {
    const defaultName = `${kubeContextName}_${kubeNamespace}`;
    if (!agents) {
        // eslint-disable-next-line no-param-reassign
        agents = await sdk.agents.list({ });
    }
    let name;

    if (!_.isArray(agents) || !_.find(agents, a => a.name === defaultName)) {
        name = defaultName; // use the default name if there are no collisions
    } else {
        const agentsNames = new Set(_.map(agents, a => a.name)); // for fast lookup
        let i = 1;
        while (agentsNames.has(`${defaultName}_${i}`)) {
            i += 1;
        }
        name = `${defaultName}_${i}`;
    }

    return name;
}

module.exports = {
    getNewAgentName,
};
