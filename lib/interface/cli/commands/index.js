const auth             = require('./auth');
const run              = require('./run');
const createResource   = require('./create');
const getResource      = require('./get');
const deleteResource   = require('./delete');
const describeResource = require('./describe');
const applyResource    = require('./apply');

module.exports = {
    auth,
    run,
    createResource,
    deleteResource,
    describeResource,
    getResource,
    applyResource,
};