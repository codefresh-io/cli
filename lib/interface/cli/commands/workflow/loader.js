const getRoot = require('../root/get.cmd');
const describeRoot = require('../root/describe.cmd');

const get = require('./get');
const describe = require('./describe');

getRoot.subCommand(get);
describeRoot.subCommand(describe);
