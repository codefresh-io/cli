const annotate = require('./annotate');
const auth = require('./auth');
const get = require('./get');
const apply = require('./apply');
const create = require('./create');
const deleteCmd = require('./delete');
const replace = require('./replace');
const describe = require('./describe');
const run = require('./run');

module.exports = {
    annotate,
    auth,
    get,
    apply,
    create,
    delete: deleteCmd,
    replace,
    describe,
    run,
};
