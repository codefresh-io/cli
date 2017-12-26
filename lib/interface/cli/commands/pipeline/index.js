const applyRoot = require('../root/apply-cmd');
const getRoot = require('../root/get-cmd');
const describeRoot = require('../root/describe-cmd');
const runRoot = require('../root/run-cmd');

const apply = require('./apply');
const get = require('./get');
const describe = require('./describe');
const runSingle = require('./runSingle');
const runParallel = require('./runParallel');

applyRoot.subCommand(apply);
getRoot.subCommand(get);
describeRoot.subCommand(describe);
runRoot.subCommand(runSingle);
runRoot.subCommand(runParallel);
