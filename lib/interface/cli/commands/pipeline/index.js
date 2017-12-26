const applyRoot = require('../root/apply');
const getRoot = require('../root/get');
const describeRoot = require('../root/describe');
const runRoot = require('../root/run');

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
