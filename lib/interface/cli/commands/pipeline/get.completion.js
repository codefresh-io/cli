const pipeline = () => require('../../../../logic').api.pipeline;
const { authContextWrapper } = require('../../completion/helpers');

const positionalHandler = async ({word, argv}) => {
    const pips = await pipeline().getAll({ limit: 25, offset: 0 });
    return pips.map(p => p.name);
};

module.exports = {
    positionalHandler: authContextWrapper(positionalHandler),
};

