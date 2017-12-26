const annotate = require('./annotate-cmd');
const auth = require('./auth-cmd');
const get = require('./get-cmd');
const apply = require('./apply-cmd');
const create = require('./create-cmd');
const deleteCmd = require('./delete-cmd');
const replace = require('./replace-cmd');
const describe = require('./describe-cmd');
const run = require('./run-cmd');

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
