const _ = require('lodash');
const steps = () => require('../../../../logic').sdk.steps;
const StepType = require('../../../../logic/entities/StepType');
const { authContextWrapper } = require('../../completion/helpers');

const positionalHandler = async ({word, argv}) => {
    const stps = await steps().list({ limit: 25, offset: 0 });
    return _.map(_.get(stps, 'docs'), StepType.fromResponse).map(p => p.name);
};

module.exports = {
    positionalHandler: authContextWrapper(positionalHandler),
};

