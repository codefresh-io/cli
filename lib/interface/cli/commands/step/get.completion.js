const _ = require('lodash');
const pipelines = () => require('../../../../logic').sdk.pipelines;
const Pipeline = require('../../../../logic/entities/Pipeline');
const { authContextWrapper } = require('../../completion/helpers');

const positionalHandler = async ({word, argv}) => {
    const pips = await pipelines().list({ limit: 25, offset: 0 });
    return _.map(_.get(pips, 'docs'), Pipeline.fromResponse).map(p => p.name);
};

module.exports = {
    positionalHandler: authContextWrapper(positionalHandler),
};

