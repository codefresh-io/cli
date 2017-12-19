const auth             = require('./auth');
const run              = require('./run');
const createResource   = require('./create');
const getResource      = require('./get');
const deleteResource   = require('./delete');
const describeResource = require('./describe');
const applyResource    = require('./apply');
const replaceResource  = require('./replace');
const annotate         = require('./annotate');

module.exports = {
    auth,
    run,
    createResource,
    deleteResource,
    describeResource,
    getResource,
    applyResource,
    replaceResource,
    annotate,
};