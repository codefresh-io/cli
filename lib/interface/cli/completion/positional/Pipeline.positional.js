const getPipelines = async (word, argv) => {
    const { pipeline } = require('../../../../logic').api;

    const pips = await pipeline.getAll({ limit: 25, offset: 0 });
    return pips.map(p => p.name);
};

module.exports = {
    'get.pipelines': getPipelines,
};
