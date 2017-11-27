const auth   = require('./auth');
const run    = require('./run');
const create = require('./create');
const del = require('./delete');
const describe = require('./describe');
const replace = require('./replace');

module.exports = {
    auth,
    run,
    create,
    del,
    describe,
    replace,
};